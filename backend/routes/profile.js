// Video on storing password (encryption, hashing, salting, and using 3rd party authentification): https://www.youtube.com/watch?v=qgpsIBLvrGY
// Video on how to use

import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import {
  getErrorCode,
  errorWrongEmail,
  errorWrongPassword,
  errorProfileEmailAlreadyExists,
  errorProfilePhoneNumberAlreadyExists
} from "../errorMessage.js"


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
router.post("/get", async (req, res) => {
  try {
    const { email, password } = req.body; // Get data from body
    const profile = await getProfile(email, password);
    res.status(200).json({ profile: profile }); // Send back response
    //y TODO: implement password encryption (right now it is just being sent directly)
    //y TODO: add variable validation (like "email" needs to be "not null" in database)
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body; // Get data from body
    const profile = await createProfile(email, password, phoneNumber);
    res.status(201).json({ profile: profile }); // Send back response
    //y TODO: implement password encryption (right now it is just being sent directly)
    //y TODO: add variable validation (like "email" needs to be "not null" in database)
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
  }
});

router.post("/delete", async (req, res) => {
  try {
    const { email, password, } = req.body; // Get data from body
    await deleteProfile(email, password);
    res.status(200).json({}); // No message
    //y TODO: implement password encryption (right now it is just being sent directly)
    //y TODO: add variable validation (like "email" needs to be "not null" in database)
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
  }
});

router.post("/modify", async (req, res) => {
  try {
    const { email, password, propertyName, newValue } = req.body; // Get data from body
    const profile = await modifyProfile(email, password, propertyName, newValue);
    res.status(201).json({ profile: profile }); // Send back response
    //y TODO: implement password encryption (right now it is just being sent directly)
    //y TODO: add variable validation (like "email" needs to be "not null" in database)
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
  }
});

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a profile from the database using email and password.
 * @param {*} email string
 * @param {*} password string
 * @returns either a JSON object with the profile (from the MySQL database), or a Promise.reject() with an error message.
 */
export async function getProfile(email, password) {
  // Get an array of profiles with the corresponding email from the database
  const [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);

  // Check that profile exists and password is right
  if (Object.keys(profile).length === 0) {
    return Promise.reject(errorWrongEmail);
  } else if (await bcrypt.compare(password, profile[0].PasswordHash) === false) {
    return Promise.reject(errorWrongPassword);
  }
  // Return profile
  return profile[0];
}

/** 
 * Tries to add a profile to the database.
 * @param {*} email string
 * @param {*} password string
 * @param {*} phoneNumber int
 * @returns either a JSON object with the profile (from the MySQL database), or a Promise.reject() with an error message.
 */
async function createProfile(email, password, phoneNumber) {
  // Check if the email is already used by an existing profile
  let [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
  if (Object.keys(profile).length !== 0) {
    return Promise.reject(errorProfileEmailAlreadyExists);
  }
  // Check if the phone number is already used by an existing profile
  [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber='${phoneNumber}';`);
  if (Object.keys(profile).length !== 0) {
    return Promise.reject(errorProfilePhoneNumberAlreadyExists);
  }
  // Salt and hash password
  const passwordHash = await bcrypt.hash(password, saltingRounds);
  // Add profile to database
  await pool.query(`INSERT INTO p2.Profile 
      (Email, Password, PhoneNumber)
      VALUES ('${email}', '${passwordHash}', ${phoneNumber})`);
  [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
  // Return profile
  return profile[0];
}

/** 
 * Tries to delete the profile from the database.
 * @param {*} email string.
 * @param {*} password string.
 */
async function deleteProfile(email, password) {
  // Tries to get the profile from the database (if it does not exist, this returns a promise reject)
  await getProfile(email, password);
  // Delete the profile
  await pool.query(`DELETE FROM p2.Profile WHERE Email='${email}';`);
}

/** 
 * Tries to assign a new value to a property of a profile in the database.
 * @param {*} email string.
 * @param {*} password string.
 * @param {*} propertyName string name of the property in the MySQL database.
 * @param {*} newValue the new value of the property.
 * @returns either a JSON object with the profile (from the MySQL database), or a Promise.reject() with an error message.
 */
async function modifyProfile(email, password, propertyName, newValue) {
  // Check that profile exists and password is right
  const profile = await getProfile(email, password);
  const profileID = profile.ID;
  // Property-specific cases
  let otherProfile;
  switch (propertyName) {
    case "Email":
      [otherProfile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${newValue}';`);
      if (Object.keys(otherProfile).length !== 0) {
        return Promise.reject(errorProfileEmailAlreadyExists);
      }
      break;
    case "PhoneNumber":
      [otherProfile] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber='${newValue}';`);
      if (Object.keys(otherProfile).length !== 0) {
        return Promise.reject(errorProfilePhoneNumberAlreadyExists);
      }
      break;
    // NOTE: When the propetyName is "PasswordHash", the newValue is not actually a hashed password,
    // but instead just a password in plain text, since the server handles the hashing itself.
    case "PasswordHash": //r
      // Salt and hash password
      const passwordHash = await bcrypt.hash(newValue, saltingRounds);
      newValue = passwordHash;
  }
  // Update property with the new value
  await pool.query(`UPDATE p2.Profile SET ${propertyName}='${newValue}' WHERE (ID='${profileID}');`);
  // Return profile
  const [updatedProfile] = await pool.query(`SELECT * FROM p2.Profile WHERE ID='${profileID}';`);
  return updatedProfile[0];
}

