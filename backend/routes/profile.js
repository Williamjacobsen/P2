// Video on storing password (encryption, hashing, salting, and using 3rd party authentification): https://www.youtube.com/watch?v=qgpsIBLvrGY
// Video on authentification using JWT tokens: https://www.youtube.com/watch?v=mbsmsi7l3r4
// Video explaining JWT tokens vs. Sessions for authentification: https://www.youtube.com/watch?v=fyTxwIa-1U0

import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodeSchedule from "node-schedule"

// JWT tokens
const accessTokenSecretKey = "aGoodSecret1"; // This is essentially a password, so it should be more complex than this placeholder.
const refreshTokenSecretKey = "aGoodSecret2"; // This is essentially a password, so it should be more complex than this placeholder.
const accessTokenExpirationAge = "10m";
const refreshTokenExpirationAgeInDays = 7;

// Hashing
// The bigger this is, the more processing power the salting needs 
// (this needs to find a compromise between not being too slow to 
// hinder user experience (less than a second of processing time) 
// and not being too fast to compromise security to brute force attacks).
const saltingRounds = 11;

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Router
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const router = express.Router();
export default router;

router.post("/sign-in", async (req, res) => {
  try {
    // Get data from body
    const { email, password, deviceName } = req.body;
    // Get an array of profiles with the corresponding email from the database
    const [profileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
    // Verify that profile exists
    if (Object.keys(profileRows).length === 0) {
      res.status(404).json({ error: "Email does not have a profile." }); // 404 = Not Found
      return;
    }
    // Verify password
    if (await bcrypt.compare(password, profileRows[0].PasswordHash) === false) {
      res.status(401).json({ error: "Password does not match email." }); // 401 = Unauthorized
      return;
    }
    // Create an access token containing the user's profile ID
    const profileID = profileRows[0].ID;
    const refreshToken = await generateRefreshToken(profileID, deviceName);
    const accessToken = await generateAccessToken(res, refreshToken);
    if (accessToken === null) {
      return;
    }
    // Send back response with access token
    res.status(200).json({ refreshToken: refreshToken, accessToken: accessToken }); // 200 = OK
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
})

router.post("/generate-access-token", async (req, res) => {
  try {
    // Get data from body
    const { refreshToken } = req.body;
    // Create a new access token using the refresh token
    const accessToken = await generateAccessToken(res, refreshToken);
    if (accessToken === null) {
      return;
    }
    // Response. Send back access token.
    res.status(201).json({ accessToken: accessToken }); // 201 = Created
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
})

router.post("/sign-out-device", async (req, res) => {
  //y NOTE: This does not invalidate non-expired ACCESS tokens, only REFRESH tokens.
  try {
    // Get data from body
    const { refreshToken } = req.body;
    // Remove refresh tokens from the server
    await pool.query(`DELETE FROM p2.ProfileRefreshToken WHERE Token='${refreshToken}';`);
    // Response. No message. 
    res.status(204).json({}); // 204 = No content
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
})

router.post("/sign-out-all-devices", async (req, res) => {
  //y NOTE: This does not invalidate non-expired ACCESS tokens, only REFRESH tokens.
  try {
    // Get data from body
    const { refreshToken } = req.body;
    // Extract payload from refresh token
    const decodedRefreshToken = decodeRefreshToken(res, refreshToken);
    if (decodedRefreshToken === null) {
      return;
    }
    const profileID = decodedRefreshToken.profileID;
    // Remove refresh tokens from the server
    await pool.query(`DELETE FROM p2.ProfileRefreshToken WHERE Token='${profileID}';`);
    // Response. No message. 
    res.status(204).json({}); // 204 = No content
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
})

router.post("/get", async (req, res) => {
  try {
    const { accessToken } = req.body; // Get data from body
    const profile = await getProfile(res, accessToken);
    if (profile === null) {
      return;
    }
    res.status(200).json({ profile: profile }); // Send back response. 200 = OK
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
});

router.post("/create", async (req, res) => {
  try {
    // Get data from body
    const { email, password, phoneNumber } = req.body;
    // Check if the email is already used by an existing profile
    let [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
    if (Object.keys(profile).length !== 0) {
      res.status(409).json({ error: "Another profile already uses that email." }); // 409 = Conflict
      return;
    }
    // Check if the phone number is already used by an existing profile
    [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber='${phoneNumber}';`);
    if (Object.keys(profile).length !== 0) {
      res.status(409).json({ error: "Another profile already uses that phone number." }); // 409 = Conflict
      return;
    }
    // Salt and hash password
    const passwordHash = await bcrypt.hash(password, saltingRounds);
    // Add profile to database
    const currentDateTime = new Date();
    currentDateTime.getUTCDate();
    await pool.query(`INSERT INTO p2.Profile 
      (Email, PasswordHash, PhoneNumber, LatestRefreshTokenGenerationDateTime) 
      VALUES (?, ?, ?, ?)`,
      [email, passwordHash, phoneNumber, currentDateTime]); // I've used the "?"-notation because else it does not pass in the dateTime correctly.
    [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
    // Send back response
    res.status(201).json({ profile: profile[0] }); // 201 = Created
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
});

router.post("/delete", async (req, res) => {
  try {
    // Get data from body
    const { accessToken, password, } = req.body;
    // Tries to get the profile from the database
    const profile = await getProfile(res, accessToken);
    if (profile === null) {
      return;
    }
    // Hinder deletion if a vendor profile (this should only be done by contacting the website administrators)
    if (profile.VendorID !== null) {
      res.status(401).json({ error: "Vendor profiles cannot be deleted by the user. Please contact the website administrators if you wish to delete your vendor profile." }); // 401 = Unauthorized
      return;
    }
    // Verify password
    if (await bcrypt.compare(password, profile.PasswordHash) === false) {
      res.status(401).json({ error: "Password does not match email." }); // 401 = Unauthorized
      return;
    }
    // Delete the profile
    await pool.query(`DELETE FROM p2.Profile WHERE ID='${profile.ID}';`);
    // Response. No message. 
    res.status(204).json({}); // 204 = No Content
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
});

router.post("/modify", async (req, res) => {
  try {
    // Get data from body
    const { accessToken, password, propertyName, newValue } = req.body;
    // Check that profile exists and password is right
    const profile = await getProfile(res, accessToken);
    if (profile === null) {
      return;
    }
    const profileID = profile.ID;
    // Verify password
    if (await bcrypt.compare(password, profile.PasswordHash) === false) {
      res.status(401).json({ error: "Password does not match email." }); // 401 = Unauthorized
      return;
    }
    // Property-specific cases
    let anotherProfileRows;
    switch (propertyName) {
      case "Email":
        [anotherProfileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${newValue}';`);
        if (Object.keys(anotherProfileRows).length !== 0) {
          res.status(409).json({ error: "Another profile already uses that email." }); // 409 = Conflict
          return;
        }
        break;
      case "PhoneNumber":
        [anotherProfileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber='${newValue}';`);
        if (Object.keys(anotherProfileRows).length !== 0) {
          res.status(409).json({ error: "Another profile already uses that phone number." }); // 409 = Conflict
          return;
        }
        break;
      // NOTE: When the propetyName is "PasswordHash", the newValue is not actually a hashed password,
      // but instead just a password in plain text, since the server handles the hashing itself.
      case "PasswordHash":
        // Salt and hash password
        const passwordHash = await bcrypt.hash(newValue, saltingRounds);
        newValue = passwordHash;
      case "VendorID":
        res.status(401).json({ error: "Users do not have permission to change the their profile vendor ID. Please contact the website administrators." }); // 401 = Unauthorized
        return;
    }
    // Update property with the new value
    await pool.query(`UPDATE p2.Profile SET ${propertyName}='${newValue}' WHERE (ID='${profileID}');`);
    // Return profile
    const [updatedProfileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE ID='${profileID}';`);
    // Send back response.
    res.status(201).json({ profile: updatedProfileRows[0] }); // 201 = Created
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
});

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Job schedules (using the package "node-schedule")
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

// Job for deleting expired refresh tokens in the MySQL database
const rule = new nodeSchedule.RecurrenceRule();
// Recurs every day at 3:00 AM (Denmark is +2 hours from UTC time) (because this is the time where the servers are most likely to not be under heavy load).
rule.hour = 1;
rule.minute = 0;
rule.tz = 'Etc/UTC';
nodeSchedule.scheduleJob(rule, async function () {
  console.log('SCHEDULE TASK STARTED: Deleting expired refresh tokens from database.');
  await pool.query(`DELETE FROM p2.ProfileRefreshToken WHERE ExpirationDateTime < CURDATE();`);
});

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// JWT decoding
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * @returns either a decoded JWT refresh token containing the profileID, 
 * or null if a specific error occurs 
 * (also handles sending back an error message to the client via the http response).
 */
function decodeRefreshToken(httpResponse, refreshToken) {
  try {
    const decodedRefreshToken = jwt.verify(refreshToken, refreshTokenSecretKey); // This throws an error if the validation fails.
    return decodedRefreshToken;
  }
  catch {
    httpResponse.status(401).json({ error: "Refresh token is expired." }); // 401 = Unauthorized
    return null;
  }
}

/**
 * @returns either a decoded JWT access token containing the profileID, 
 * or null if a specific error occurs 
 * (also handles sending back an error message to the client via the http response).
 */
function decodeAccessToken(httpResponse, accessToken) {
  try {
    const decodedAccessToken = jwt.verify(accessToken, accessTokenSecretKey); // This throws an error if the validation fails.
    return decodedAccessToken;
  }
  catch {
    httpResponse.status(401).json({ error: "Access token is expired." }); // 401 = Unauthorized
    return null;
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a profile from the database using a JWT access token.
 * @returns either a JSON object with the profile (from the MySQL database), 
 * or null if a specific error occurs 
 * (also handles sending back an error message to the client via the http response).
 */
export async function getProfile(httpResponse, accessToken) {
  // Verify access token
  const decodedAccessToken = decodeAccessToken(httpResponse, accessToken);
  if (decodedAccessToken === null) {
    return null;
  }
  // Extract profile ID from the token
  const profileID = decodedAccessToken.profileID;
  // Get an array of profiles with the corresponding profile ID from the database
  const [profileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE ID='${profileID}';`);
  // Check that profile exists
  if (Object.keys(profileRows).length === 0) {
    httpResponse.status(404).json({ error: "Profile does not exist in database." }); // 404 = Not found
    return null;
  }
  // Return profile
  return profileRows[0];
}

/**
 * @returns a JWT refresh token containing the profileID.
 */
async function generateRefreshToken(profileID, deviceName) {
  // Create refresh token
  const payload = { profileID };
  const refreshToken = jwt.sign(payload, refreshTokenSecretKey);
  // Add new refresh token to database, or update an existing one
  const expirationDateTime = new Date();
  expirationDateTime.setDate(expirationDateTime.getUTCDate() + refreshTokenExpirationAgeInDays);
  const [tokenForDevice] = await pool.query(`SELECT * FROM p2.ProfileRefreshToken 
    WHERE ID='${profileID}' AND DeviceName='${deviceName}';`);
  if (Object.keys(tokenForDevice).length === 0) {
    // Insert new token for the device
    await pool.query(`INSERT INTO p2.ProfileRefreshToken 
    (ProfileID, DeviceName, ExpirationDateTime, Token) 
    VALUES (?, ?, ?, ?)`,
      [profileID, deviceName, expirationDateTime, refreshToken]); // I've used the "?"-notation because else it does not pass in the dateTime correctly.
  }
  else {
    // Update existing token for the device
    const tokenID = tokenForDevice[0].ID;
    await pool.query(`UPDATE p2.ProfileRefreshToken 
      SET ExpirationDateTime=?, Token='${refreshToken}'
      WHERE (ID='${tokenID}')`,
      expirationDateTime); // I've used the "?"-notation because else it does not pass in the dateTime correctly.
  }
  // Update LatestSignInDateTime for the profile
  const currentDateTime = new Date();
  currentDateTime.getUTCDate();
  await pool.query(`UPDATE p2.Profile 
    SET LatestRefreshTokenGenerationDateTime=?
    WHERE (ID='${profileID}')`,
    currentDateTime); // I've used the "?"-notation because else it does not pass in the dateTime correctly.
  // Return refresh token
  return refreshToken;
}

/**
 * @returns either a JWT access token containing the profileID, 
 * or null if a specific error occurs 
 * (also handles sending back an error message to the client via the http response).
 */
async function generateAccessToken(httpResponse, refreshToken) {
  // Verify validity of refresh token
  const decodedRefreshToken = decodeRefreshToken(httpResponse, refreshToken);
  if (decodedRefreshToken === null) {
    return null;
  }
  // Verify that refresh token exists in the MySQL database (expired refresh tokens are automatically removed from the database via a schedule job)
  const [refreshTokenRows] = await pool.query(`SELECT * FROM p2.ProfileRefreshToken WHERE Token='${refreshToken}';`);
  if (Object.keys(refreshTokenRows).length === 0) {
    httpResponse.status(404).json({ error: "Refresh token does not exist in the database." }); // 404 = Not found
    return null;
  }
  // Create and return a new access token
  const profileID = decodedRefreshToken.profileID;
  const tokenPayload = { profileID };
  const accessToken = jwt.sign(tokenPayload, accessTokenSecretKey, { expiresIn: accessTokenExpirationAge });
  return accessToken;
}


