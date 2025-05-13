// Video on storing password (encryption, hashing, salting, and using 3rd party authentification): https://www.youtube.com/watch?v=qgpsIBLvrGY
// Video on authentification using JWT tokens: https://www.youtube.com/watch?v=mbsmsi7l3r4
// Video explaining JWT tokens vs. Sessions for authentification: https://www.youtube.com/watch?v=fyTxwIa-1U0
// Video explaining how to use bcrypt: https://www.youtube.com/watch?v=AzA_LTDoFqY

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import nodeSchedule from "node-schedule"

import pool from "../db.js";
import {
  handleValidationErrors,
  validateEmail,
  validatePassword,
  validateProfileRefreshToken,
  validateProfileAccessToken,
  validatePhoneNumber,
  validateProfilePropertyName,
  validateProfileNewValue_Part1Of2,
  validateProfileNewValue_Part2Of2
} from "../utils/inputValidation.js"


// JWT tokens
const accessTokenSecretKey = "19829hdjasljhf98312uojhsdlkjoiewrjofiadsj"; // This is essentially a password, so I smashed my head onto my keyboard a couple of times.
const refreshTokenSecretKey = "32148djkshzkjdhasi7rufykjh324i7hy7ge9f8r"; // This is essentially a password, so I smashed my head onto my keyboard a couple of times.
const accessTokenExpirationAge = "5m";
const refreshTokenExpirationAgeInDays = 7;

// Hashing
// The bigger this is, the more processing power the salting needs 
// (this needs to find a compromise between not being too slow to 
// hinder user experience (less than a second of processing time) 
// and not being too fast to compromise security to brute force attacks).
const saltingRounds = 11;

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Routes
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const router = express.Router();
export default router;

router.post("/sign-in", [
  validateEmail,
  validatePassword
], async (req, res) => {
  try {
    // Handle validation errors
    handleValidationErrors(req, res, validationResult);
    // Get data from request
    const {
      email,
      password
    } = req.body;
    await signIn(req, res, email, password);
    return res.status(200).json({}); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
})

router.post("/generate-access-token", [
  validateProfileRefreshToken
], async (req, res) => {
  try {
    // Handle validation errors
    handleValidationErrors(req, res, validationResult);
    // Get data from request
    const refreshToken = req.cookies.profileRefreshToken;
    // Create a new access token using the refresh token
    const accessToken = await generateAccessToken(res, refreshToken);
    // Send back response
    res.set('Cache-Control', 'no-store'); // Prevents caching of the response (for security reasons).
    setSecureCookie(res, "profileAccessToken", accessToken, 60 * 60 * 24);
    return res.status(201).json({}); // 201 = Created
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
})

router.post("/sign-out-device", [
  validateProfileRefreshToken,
  validateProfileAccessToken
], async (req, res) => {
  // NOTE: This does not invalidate non-expired ACCESS tokens, only REFRESH tokens.
  try {
    // Handle validation errors
    handleValidationErrors(req, res, validationResult);
    // Get data from request
    const refreshToken = req.cookies.profileRefreshToken;
    const accessToken = req.cookies.profileAccessToken;
    // Remove refresh tokens from the server
    await pool.query(`DELETE FROM p2.ProfileRefreshToken WHERE Token='${refreshToken}';`);
    // Send back response
    res.set('Cache-Control', 'no-store'); // Prevents caching of the response (for security reasons).
    setSecureCookie(res, "profileRefreshToken", refreshToken, 0);
    setSecureCookie(res, "profileAccessToken", accessToken, 0);
    return res.status(200).json({}); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
})

router.post("/sign-out-all-devices", [
  validateProfileRefreshToken,
  validateProfileAccessToken
], async (req, res) => {
  // NOTE: This does not invalidate non-expired ACCESS tokens, only REFRESH tokens.
  try {
    // Handle validation errors
    handleValidationErrors(req, res, validationResult);
    // Get data from request
    const refreshToken = req.cookies.profileRefreshToken;
    const accessToken = req.cookies.profileAccessToken;
    // Extract payload from refresh token
    const decodedRefreshToken = await decodeRefreshToken(res, refreshToken);
    const profileID = decodedRefreshToken.profileID;
    // Remove refresh tokens from the server
    await pool.query(`DELETE FROM p2.ProfileRefreshToken WHERE ProfileID='${profileID}';`);
    // Send back response
    res.set('Cache-Control', 'no-store'); // Prevents caching of the response (for security reasons).
    setSecureCookie(res, "profileRefreshToken", refreshToken, 0);
    setSecureCookie(res, "profileAccessToken", accessToken, 0);
    return res.status(200).json({}); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
})

router.get("/get", [
  validateProfileAccessToken
], async (req, res) => {
  try {
    // Handle validation errors
    handleValidationErrors(req, res, validationResult, function (validationErrors) {
      if (validationErrors.array().some(error => error.path === "profileAccessToken")) {
        const errorMessage = "Access token cookie is empty";
        res.status(400).json({ error: errorMessage }); // 400 = Bad request
        throw Error(errorMessage);
      }
    });
    // Get data from response
    const accessToken = req.cookies.profileAccessToken;
    // Get profile
    const profile = await getProfile(res, accessToken);
    // Send back response.
    res.set('Cache-Control', 'no-store'); // Prevents caching of the response (for security reasons).
    return res.status(200).json({ profile: profile }); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

router.post("/create", [
  validateEmail,
  validatePassword,
  validatePhoneNumber
], async (req, res) => {
  try {
    // Handle validation errors
    handleValidationErrors(req, res, validationResult);
    // Get data from request
    const {
      email,
      password,
      phoneNumber
    } = req.body;
    // Check if the email is already used by an existing profile
    let [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
    if (Object.keys(profile).length !== 0) {
      return res.status(409).json({ error: "Another profile already uses that email." }); // 409 = Conflict
    }
    // Check if the phone number is already used by an existing profile
    [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber='${phoneNumber}';`);
    if (Object.keys(profile).length !== 0) {
      return res.status(409).json({ error: "Another profile already uses that phone number." }); // 409 = Conflict
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
    // Send back response
    await signIn(req, res, email, password);
    return res.status(201).json({}); // 201 = Created
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

router.post("/delete", [
  validatePassword,
  validateProfileAccessToken
], async (req, res) => {
  try {
    // Handle validation errors
    handleValidationErrors(req, res, validationResult);
    // Get data from request
    const {
      password
    } = req.body;
    const refreshToken = req.cookies.profileRefreshToken;
    const accessToken = req.cookies.profileAccessToken;
    // Tries to get the profile from the database
    const profile = await getProfile(res, accessToken);
    // Hinder deletion if a vendor profile (this should only be done by contacting the website administrators)
    if (profile.VendorID !== null) {
      return res.status(401).json({ error: "Vendor profiles cannot be deleted by the user. Please contact the website administrators if you wish to delete your vendor profile." }); // 401 = Unauthorized
    }
    // Verify password
    if (await bcrypt.compare(password, profile.PasswordHash) === false) {
      return res.status(401).json({ error: "Password does not match email." }); // 401 = Unauthorized
    }
    // Delete the profile
    res.set('Cache-Control', 'no-store'); // Prevents caching of the response (for security reasons).
    setSecureCookie(res, "profileRefreshToken", refreshToken, 0);
    setSecureCookie(res, "profileAccessToken", accessToken, 0);
    await pool.query(`DELETE FROM p2.Profile WHERE ID='${profile.ID}';`);
    // Send back response
    return res.status(200).json({}); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

router.put("/modify", [
  validatePassword,
  validateProfilePropertyName,
  validateProfileNewValue_Part1Of2, // This does not take into account the property name.
  validateProfileAccessToken
], async (req, res) => {
  try {
    // Handle validation errors
    handleValidationErrors(req, res, validationResult);
    // Get data from request
    let {
      password,
      propertyName,
      newValue
    } = req.body;
    const accessToken = req.cookies.profileAccessToken;
    // Do additional validation for the newValue depending on the propertyName
    validateProfileNewValue_Part2Of2(res, propertyName, newValue);
    // Check that profile exists and password is right
    const profile = await getProfile(res, accessToken);
    const profileID = profile.ID;
    // Verify password
    if (await bcrypt.compare(password, profile.PasswordHash) === false) {
      return res.status(401).json({ error: "Password does not match email." }); // 401 = Unauthorized
    }
    // Property-specific cases
    let anotherProfileRows;
    switch (propertyName) {
      case "Email":
        [anotherProfileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${newValue}';`);
        if (Object.keys(anotherProfileRows).length !== 0) {
          return res.status(409).json({ error: "Another profile already uses that email." }); // 409 = Conflict
        }
        break;
      case "PhoneNumber":
        [anotherProfileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber='${newValue}';`);
        if (Object.keys(anotherProfileRows).length !== 0) {
          return res.status(409).json({ error: "Another profile already uses that phone number." }); // 409 = Conflict
        }
        break;
      case "Password":
        // Salt and hash password
        const passwordHash = await bcrypt.hash(newValue, saltingRounds);
        newValue = passwordHash;
        propertyName = "PasswordHash";
        break;
      case "VendorID":
        return res.status(401).json({ error: "Users do not have permission to change their profile vendor ID. Please contact the website administrators." }); // 401 = Unauthorized
    }
    // Update property with the new value
    await pool.query(`UPDATE p2.Profile SET ${propertyName}='${newValue}' WHERE (ID='${profileID}');`);
    // Send back response.
    return res.status(201).json({}); // 201 = Created
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Job schedules (using the package "node-schedule")
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

// Job for deleting expired refresh tokens in the MySQL database
const rule = new nodeSchedule.RecurrenceRule();
// Recurs every day at 3:00 AM (Denmark is +2 hours from UTC time) 
// (because this is the time where the servers are most likely to not be under heavy load).
rule.hour = 1;
rule.minute = 0;
rule.tz = 'Etc/UTC';
nodeSchedule.scheduleJob(rule, async function () {
  console.log('SCHEDULE TASK STARTED: Deleting expired refresh tokens from database.');
  await pool.query(`DELETE FROM p2.ProfileRefreshToken WHERE ExpirationDateTime < NOW();`);
});

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// JWT decoding
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * @returns either a decoded JWT refresh token containing the profileID, 
 * or a Promise.reject with an error message.
 */
async function decodeRefreshToken(httpResponse, refreshToken) {
  try {
    const decodedRefreshToken = jwt.verify(refreshToken, refreshTokenSecretKey); // This throws an error if the validation fails.
    // Check expiration date in database
    const [unexpiredRefreshTokenRows] = await pool.query(`SELECT * FROM p2.ProfileRefreshToken 
      WHERE Token='${refreshToken}' AND ExpirationDateTime >= NOW();`);
    if (Object.keys(unexpiredRefreshTokenRows).length === 0) {
      throw Error("Refresh token is expired");
    }
    return decodedRefreshToken;
  }
  catch {
    const error = "Refresh token is invalid";
    httpResponse.status(401).json({ error: error }); // 401 = Unauthorized
    return Promise.reject(error);
  }
}

/**
 * @returns either a decoded JWT access token containing the profileID, 
 * or throw an error.
 */
function decodeAccessToken(httpResponse, accessToken) {
  try {
    const decodedAccessToken = jwt.verify(accessToken, accessTokenSecretKey); // This throws an error if the validation fails.
    return decodedAccessToken;
  }
  catch {
    const error = "Access token is invalid";
    httpResponse.status(401).json({ error: error }); // 401 = Unauthorized
    throw Error(error);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a profile from the database using a JWT access token.
 * @returns either a JSON object with the profile (from the MySQL database), 
 * or a Promise.reject with an error message.
 */
export async function getProfile(httpResponse, accessToken) {
  // Verify access token
  const decodedAccessToken = decodeAccessToken(httpResponse, accessToken);
  // Extract profile ID from the token
  const profileID = decodedAccessToken.profileID;
  // Get an array of profiles with the corresponding profile ID from the database
  const [profileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE ID='${profileID}';`);
  // Check that profile exists
  if (Object.keys(profileRows).length === 0) {
    const error = "Profile does not exist in database.";
    httpResponse.status(404).json({ error: error }); // 404 = Not found
    return Promise.reject(error);
  }
  // Return profile
  return profileRows[0];
}

/**
 * @param oldRefreshToken 
 *    If null, a new refresh token will be added to the database.
 *    If not null, an old refresh token entry in the database will be updated with a new token value.
 * @returns a JWT refresh token containing the profileID.
 */
async function generateRefreshToken(httpRequest, profileID) {
  // Create new refresh token
  const payload = { profileID };
  const newRefreshToken = jwt.sign(payload, refreshTokenSecretKey);
  // Check whether to update an old refresh token, or create a new refresh token
  const oldRefreshToken = httpRequest.cookies.profileRefreshToken; // If it does not exist, it returns "undefined"
  let shouldUpdateOldToken = false;
  if (oldRefreshToken !== undefined) {
    const [oldTokenRows] = await pool.query(`SELECT * FROM p2.ProfileRefreshToken WHERE Token='${oldRefreshToken}';`);
    if (Object.keys(oldTokenRows).length !== 0) {
      shouldUpdateOldToken = true;
    }
  }
  // Add new refresh token to database as a new entry, or update an existing database entry
  const expirationDateTime = new Date();
  expirationDateTime.setDate(expirationDateTime.getUTCDate() + refreshTokenExpirationAgeInDays);
  if (shouldUpdateOldToken) {
    // Update existing token
    await pool.query(`UPDATE p2.ProfileRefreshToken 
      SET ExpirationDateTime=?, Token='${newRefreshToken}'
      WHERE (Token='${oldRefreshToken}')`,
      expirationDateTime); // I've used the "?"-notation because else it does not pass in the dateTime correctly.
  } else {
    // Insert new token
    await pool.query(`INSERT INTO p2.ProfileRefreshToken 
    (ProfileID, ExpirationDateTime, Token) 
    VALUES (?, ?, ?)`,
      [profileID, expirationDateTime, newRefreshToken]); // I've used the "?"-notation because else it does not pass in the dateTime correctly.
  }
  // Update LatestSignInDateTime for the profile
  const currentDateTime = new Date();
  currentDateTime.getUTCDate();
  await pool.query(`UPDATE p2.Profile 
    SET LatestRefreshTokenGenerationDateTime=?
    WHERE (ID='${profileID}')`,
    currentDateTime); // I've used the "?"-notation because else it does not pass in the dateTime correctly.
  // Return refresh token
  return newRefreshToken;
}

/**
 * @returns either a JWT access token containing the profileID, 
 * or a Promise.reject with an error message.
 */
async function generateAccessToken(httpResponse, refreshToken) {
  // Verify validity of refresh token
  const decodedRefreshToken = await decodeRefreshToken(httpResponse, refreshToken);
  // Verify that refresh token exists in the MySQL database (expired refresh tokens are automatically removed from the database via a schedule job)
  const [refreshTokenRows] = await pool.query(`SELECT * FROM p2.ProfileRefreshToken WHERE Token='${refreshToken}';`);
  if (Object.keys(refreshTokenRows).length === 0) {
    const error = "Refresh token does not exist in the database.";
    httpResponse.status(404).json({ error: error }); // 404 = Not found
    return Promise.reject(error);
  }
  // Create and return a new access token
  const profileID = decodedRefreshToken.profileID;
  const tokenPayload = { profileID };
  const accessToken = jwt.sign(tokenPayload, accessTokenSecretKey, { expiresIn: accessTokenExpirationAge });
  return accessToken;
}

/**
 * Sets a cookie with all the proper security features enabled in the HTTP response.
 */
function setSecureCookie(httpResponse, cookieName, value, maxAgeInSeconds) {
  httpResponse.cookie(cookieName, value, {
    httpOnly: true,                 // Effect: Cannot be accessed using Javascript (e.g. using "document.cookies").
    secure: true,                   // Effect: Can only be sent using HTTPS (which is encrypted).
    sameSite: "Strict",             // Effect: Can only be sent to the website's origin site, not third parties (e.g. protects against "cross-site request forgery" attacks).
    maxAge: 1000 * maxAgeInSeconds   // Expiration (in milliseconds)
  });
}

/**
 * Uses email and password to create refresh and access tokens 
 * and put them into a secure cookie.
 */
async function signIn(httpRequest, httpResponse, email, password) {
  // Get an array of profiles with the corresponding email from the database
  const [profileRows] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
  // Verify that profile exists
  if (Object.keys(profileRows).length === 0) {
    const error = "Email does not have a profile.";
    httpResponse.status(404).json({ error: error }); // 404 = Not Found
    return Promise.reject(error);
  }
  // Verify password
  if (await bcrypt.compare(password, profileRows[0].PasswordHash) === false) {
    const error = "Password does not match email.";
    httpResponse.status(401).json({ error: error }); // 401 = Unauthorized
    return Promise.reject(error);
  }
  // Create an access token containing the user's profile ID
  const profileID = profileRows[0].ID;
  const refreshToken = await generateRefreshToken(httpRequest, profileID);
  const accessToken = await generateAccessToken(httpResponse, refreshToken);
  // Prepare cookie
  httpResponse.set('Cache-Control', 'no-store'); // Prevents caching of the response (for security reasons).
  setSecureCookie(httpResponse, "profileRefreshToken", refreshToken, 60 * 60 * 24 * 7);
  setSecureCookie(httpResponse, "profileAccessToken", accessToken, 60 * 60 * 24);
}


