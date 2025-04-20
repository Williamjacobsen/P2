// Video on storing password (encryption, hashing, salting, and using 3rd party authentification): https://www.youtube.com/watch?v=qgpsIBLvrGY
// Video on authentification using JWT tokens: https://www.youtube.com/watch?v=mbsmsi7l3r4
// Video explaining JWT tokens vs. Sessions for authentification: https://www.youtube.com/watch?v=fyTxwIa-1U0

import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import {
  getErrorCode,
  errorWrongEmail,
  errorWrongPassword,
  errorProfileEmailAlreadyExists,
  errorProfilePhoneNumberAlreadyExists,
  errorTriedToDeleteVendorProfile,
} from "../errorMessage.js"
import jwt from "jsonwebtoken";

// JWT tokens
const accessTokenSecretKey = "aGoodSecret1"; // This is essentially a password, so it should be more complex than this placeholder.
const refreshTokenSecretKey = "aGoodSecret2"; // This is essentially a password, so it should be more complex than this placeholder.
const accessTokenExpirationAge = "10m";

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
    const { email, password } = req.body;
    // Get an array of profiles with the corresponding email from the database
    const [profileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
    // Verify that profile exists
    if (Object.keys(profileRows).length === 0) {
      throw Error(errorWrongEmail);
    }
    // Verify password
    if (await bcrypt.compare(password, profileRows[0].PasswordHash) === false) {
      throw Error(errorWrongPassword);
    }
    // Create an access token containing the user's profile ID
    const profileID = profileRows[0].ID;
    const refreshToken = await generateRefreshToken(profileID);
    const accessToken = await generateAccessToken(refreshToken);
    // Send back response with access token
    res.status(200).json({ refreshToken: refreshToken, accessToken: accessToken }); // 200 = OK
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
    //R needs "403 = forbidden" error code in case jwt.verify makes error
  }
})

router.post("/generate-access-token", async (req, res) => {
  try {
    // Get data from body
    const { refreshToken } = req.body;
    // Create a new access token using the refresh token
    const newAccessToken = await generateAccessToken(refreshToken);
    // Response. Send back access token.
    res.status(201).json({ accessToken: newAccessToken }); // 201 = Created
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
    //R needs "403 = forbidden" error code in case jwt.verify makes error
  }
})

router.post("/sign-out", async (req, res) => {
  try {
    // Get data from body
    const { refreshToken } = req.body;
    //y Remove refresh tokens from server
    //y invalidate older access tokens
    // Response. No message. 
    res.status(204).json({}); // 204 = No content
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
    //R
  }
})

//y TODO: Make sign out for all refresh tokens for all accounts

router.post("/get", async (req, res) => {
  try {
    const { accessToken } = req.body; // Get data from body
    const profile = await getProfile(accessToken);
    res.status(200).json({ profile: profile }); // Send back response. 200 = OK
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
    //R needs "403 = forbidden" error code in case jwt.verify makes error
  }
});

router.post("/create", async (req, res) => {
  try {
    // Get data from body
    const { email, password, phoneNumber } = req.body;
    // Check if the email is already used by an existing profile
    let [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
    if (Object.keys(profile).length !== 0) {
      throw Error(errorProfileEmailAlreadyExists);
    }
    // Check if the phone number is already used by an existing profile
    [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber='${phoneNumber}';`);
    if (Object.keys(profile).length !== 0) {
      throw Error(errorProfilePhoneNumberAlreadyExists);
    }
    // Salt and hash password
    const passwordHash = await bcrypt.hash(password, saltingRounds);
    // Add profile to database
    await pool.query(`INSERT INTO p2.Profile 
      (Email, PasswordHash, PhoneNumber) 
      VALUES (?, ?, ?)`,
      [email, passwordHash, phoneNumber]);
    [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
    // Send back response
    res.status(201).json({ profile: profile[0] }); // 201 = Created
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
    //R needs "403 = forbidden" error code in case jwt.verify makes error
  }
});

router.post("/delete", async (req, res) => {
  try {
    // Get data from body
    const { accessToken, password, } = req.body;
    // Tries to get the profile from the database (if it does not exist, this returns a promise reject)
    const profile = await getProfile(accessToken);
    // Hinder deletion if a vendor profile (this should only be done by contacting the website administrators)
    if (profile.VendorID !== null) {
      throw Error(errorTriedToDeleteVendorProfile);
    }
    // Verify password
    if (await bcrypt.compare(password, profile.PasswordHash) === false) {
      throw Error(errorWrongPassword);
    }
    // Delete the profile
    await pool.query(`DELETE FROM p2.Profile WHERE ID='${profile.ID}';`);
    // Response. No message. 
    res.status(204).json({}); // 204 = No Content
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
    //R needs "403 = forbidden" error code in case jwt.verify makes error
  }
});

router.post("/modify", async (req, res) => {
  try {
    // Get data from body
    const { accessToken, password, propertyName, newValue } = req.body;
    // Check that profile exists and password is right
    const profile = await getProfile(accessToken);
    const profileID = profile.ID;
    // Verify password
    if (await bcrypt.compare(password, profile.PasswordHash) === false) {
      throw Error(errorWrongPassword);
    }
    // Property-specific cases
    let otherProfile;
    switch (propertyName) {
      case "Email":
        [otherProfile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${newValue}';`);
        if (Object.keys(otherProfile).length !== 0) {
          throw Error(errorProfileEmailAlreadyExists);
        }
        break;
      case "PhoneNumber":
        [otherProfile] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber='${newValue}';`);
        if (Object.keys(otherProfile).length !== 0) {
          throw Error(errorProfilePhoneNumberAlreadyExists);
        }
        break;
      // NOTE: When the propetyName is "PasswordHash", the newValue is not actually a hashed password,
      // but instead just a password in plain text, since the server handles the hashing itself.
      case "PasswordHash":
        // Salt and hash password
        const passwordHash = await bcrypt.hash(newValue, saltingRounds);
        newValue = passwordHash;
      case "VendorID":
        throw Error("Users do not have permission to change the their profile vendor ID. Please contact the website administrators."); //R
    }
    // Update property with the new value
    await pool.query(`UPDATE p2.Profile SET ${propertyName}='${newValue}' WHERE (ID='${profileID}');`);
    // Return profile
    const [updatedProfileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE ID='${profileID}';`);
    // Send back response.
    res.status(201).json({ profile: updatedProfileRows[0] }); // 201 = Created
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
    //R needs "403 = forbidden" error code in case jwt.verify makes error
  }
});



// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a profile from the database using a JWT access token.
 * @returns either a JSON object with the profile (from the MySQL database), or a Promise.reject() with an error message.
 */
export async function getProfile(accessToken) {
  // Verify access token
  let decodedAccessToken;
  try { decodedAccessToken = jwt.verify(accessToken, accessTokenSecretKey); } // This throws an error if the validation fails.
  catch { return Promise.reject("Access token has expired"); } //R
  // Extract profile ID from the token
  const profileID = decodedAccessToken.profileID;
  // Get an array of profiles with the corresponding profile ID from the database
  const [profileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE ID='${profileID}';`);
  // Check that profile exists
  if (Object.keys(profileRows).length === 0) {
    return Promise.reject(errorWrongEmail); //R it's not wrong email
  }
  // Return profile
  return profileRows[0];
}

/**
 * @returns a JWT access token.
 */
async function generateRefreshToken(profileID) {
  // Create refresh token
  const payload = { profileID };
  const refreshToken = jwt.sign(payload, refreshTokenSecretKey);
  // Add new refresh token to database
  const expirationDateTime = new Date();
  expirationDateTime.getUTCDate(); //r this might need to be changed to not UTC, so just getDate().
  await pool.query(`INSERT INTO p2.ProfileRefreshToken 
    (ProfileID, ExpirationDateTime, Token) 
    VALUES (?, ?, ?)`,
    [profileID, expirationDateTime, refreshToken]);
  // Return refresh token
  return refreshToken;
}

/**
 * Throws an error if validation of the refresh token fails.
 * @returns a JWT access token.
 */
async function generateAccessToken(refreshToken) {
  // Verify validity of refresh token
  let decodedRefreshToken;
  try { decodedRefreshToken = jwt.verify(refreshToken, refreshTokenSecretKey); } // This throws an error if the validation fails.
  catch { return Promise.reject("Refresh token has expired"); } //r
  // Verify that refresh token exists in the MySQL database (expired refresh tokens are automatically removed from the database) //r need to implement this automatic deletion
  const [refreshTokenRows] = await pool.query(`SELECT * FROM p2.ProfileRefreshToken WHERE Token='${refreshToken}';`);
  if (Object.keys(refreshTokenRows).length === 0) {
    return Promise.reject("Profile refresh token does not exist in database."); //r 
  }
  // Create and return a new access token
  const profileID = decodedRefreshToken.profileID;
  const tokenPayload = { profileID };
  const accessToken = jwt.sign(tokenPayload, accessTokenSecretKey, { expiresIn: accessTokenExpirationAge });
  return accessToken;
}

