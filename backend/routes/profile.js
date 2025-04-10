import express from "express";
import pool from "../db.js";

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
// Error messages
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const errorWrongEmail = "Email does not have a profile.";
const errorWrongPassword = "Password does not match email.";
const errorProfileEmailAlreadyExists = "Another profile already uses that email.";
const errorProfilePhoneNumberAlreadyExists = "Another profile already uses that phone number.";

function getErrorCode(errorMessage) {
  switch (errorMessage) {
    case errorWrongEmail: return 404; // 404 = Not Found
    case errorWrongPassword: return 401; // 401 = Unauthorized
    case errorProfileEmailAlreadyExists: return 409; // 409 = Conflict
    case errorProfilePhoneNumberAlreadyExists: return 409; // 409 = Conflict
    default: return 500; // 500 = Internal Server Error
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a profile from the database using email and password.
 * @param {*} email string
 * @param {*} password string
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function getProfile(email, password) {
  // Get an array of profiles with the corresponding email from the database
  const [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
  // Check that profile exists and password is right
  if (Object.keys(profile).length == 0) {
    return Promise.reject(errorWrongEmail);
  } else if (profile[0].Password != password) {
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
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function createProfile(email, password, phoneNumber) {
  // Check if the email is already used by an existing profile
  let [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
  if (Object.keys(profile).length != 0) {
    return Promise.reject(errorProfileEmailAlreadyExists);
  }
  // Check if the phone number is already used by an existing profile
  [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber='${phoneNumber}';`);
  if (Object.keys(profile).length != 0) {
    return Promise.reject(errorProfilePhoneNumberAlreadyExists);
  }
  // Add profile to database
  await pool.query(`INSERT INTO p2.Profile 
      (Email, Password, PhoneNumber)
      VALUES ('${email}', '${password}', ${phoneNumber})`);
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
  // Get an array of profiles with the corresponding email from the database
  const [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
  // Check that profile exists and password is right
  if (Object.keys(profile).length === 0) {
    return Promise.reject(errorWrongEmail);
  } else if (profile[0].Password !== password) {
    return Promise.reject(errorWrongPassword);
  }
  // Delete the profile
  await pool.query(`DELETE FROM p2.Profile WHERE Email='${email}';`);
}

/** 
 * Tries to assign a new value to a property of a profile in the database.
 * @param {*} email string.
 * @param {*} password string.
 * @param {*} propertyName string name of the property in the MySQL database.
 * @param {*} newValue the new value of the property.
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function modifyProfile(email, password, propertyName, newValue) {
  // Check that profile exists and password is right
  let [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email='${email}';`);
  if (Object.keys(profile).length === 0) {
    return Promise.reject(errorWrongEmail);
  } else if (profile[0].Password !== password) {
    return Promise.reject(errorWrongPassword);
  }
  const profileID = profile[0].ID;
  // Check for duplicates (for example, two profiles cannot have the same email address)
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
  }
  // Update property with the new value
  await pool.query(`UPDATE p2.Profile SET ${propertyName}='${newValue}' WHERE (ID='${profileID}');`);
  // Return profile
  [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE ID='${profileID}';`);
  return profile[0];
}

