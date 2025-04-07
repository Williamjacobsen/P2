import express from "express";
import pool from "../db.js";

// Router
const router = express.Router();
export default router;

// Error messages
const errorWrongEmail = "Email does not have a profile.";
const errorWrongPassword = "Password does not match email.";
const errorProfileEmailAlreadyExists = "Another profile already uses that email.";
const errorProfilePhoneNumberAlreadyExists = "Another profile already uses that phone number.";

router.post("/get", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const profile = await getProfile(email, password);

    //y TODO: implement password encryption (right now it is just being sent directly)

    //y TODO: add some variable validation (like "email" needs to be "not null" in database)

    res.status(200).json({ // 200 = OK
      profile: profile
    });
  }
  catch (error) {
    // Respond with error messages
    if (error === errorWrongEmail) {
      res.status(404).json({ errorMessage: errorWrongEmail }); // 404 = Not Found
    } else if (error === errorWrongPassword) {
      res.status(401).json({ errorMessage: errorWrongPassword }); // 401 = Unauthorized
    } else {
      console.error("Database error:", error);
      res.status(500).json({ errorMessage: "Database error finding profile in database." }); // 500 = Internal Server Error
    }
  }
});

/**
 * Tries to get a profile from the database using email and password.
 * @param {*} email string
 * @param {*} password string
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function getProfile(email, password) {

  // Get an array of profiles with the corresponding email from the database
  const [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email = '${email}';`);

  // Check that profile exists and password is right
  if (Object.keys(profile).length == 0) {
    return Promise.reject(errorWrongEmail);
  } else if (profile[0].Password != password) {
    return Promise.reject(errorWrongPassword);
  }

  // Return profile
  return profile[0];
}

router.post("/create", async (req, res) => {
  try {
    const {
      email,
      password,
      phoneNumber
    } = req.body;

    //y TODO: implement password encryption (right now it is just being sent directly)

    //y TODO: add some variable validation (like "email" needs to be "not null" in database)

    const profile = await createProfile(email, password, phoneNumber);

    res.status(201).json({
      profile: profile
    });
  }
  catch (error) {
    // Respond with error messages
    if (error === errorProfileEmailAlreadyExists) {
      res.status(409).json({ errorMessage: errorProfileEmailAlreadyExists }); // 409 = Conflict
    } else if (error === errorProfilePhoneNumberAlreadyExists) {
      res.status(409).json({ errorMessage: errorProfilePhoneNumberAlreadyExists }); // 409 = Conflict
    } else {
      console.error("Database error:", error);
      res.status(500).json({ errorMessage: "Database error adding profile to database." }); // 500 = Internal Server Error
    }
  }
});

/** 
 * Tries to add a profile to the database.
 * @param {*} email string
 * @param {*} password string
 * @param {*} phoneNumber int
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function createProfile(email, password, phoneNumber) {

  // Check if the email is already used by an existing profile
  let [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email = '${email}';`);
  if (Object.keys(profile).length != 0) {
    return Promise.reject(errorProfileEmailAlreadyExists);
  }

  // Check if the phone number is already used by an existing profile
  [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE PhoneNumber = '${phoneNumber}';`);
  if (Object.keys(profile).length != 0) {
    return Promise.reject(errorProfilePhoneNumberAlreadyExists);
  }

  // Add profile to database
  await pool.query(`INSERT INTO p2.Profile 
      (Email, Password, PhoneNumber)
      VALUES ('${email}', '${password}', ${phoneNumber})`);
  [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email = '${email}';`);

  // Return profile
  return profile[0];
}


router.post("/modify", async (req, res) => {
  try {
    const {
      email,
      password,
      propertyName,
      newValue
    } = req.body;

    //y TODO: implement password encryption (right now it is just being sent directly)

    //y TODO: add some variable validation (like "email" needs to be "not null" in database)

    const profile = await modifyProfile(email, password, propertyName, newValue);

    res.status(201).json({
      profile: profile
    });
  }
  catch (error) {
    // Respond with error messages
    if (error === errorProfileEmailAlreadyExists) {
      res.status(409).json({ errorMessage: errorProfileEmailAlreadyExists }); // 409 = Conflict
    } else if (error === errorProfilePhoneNumberAlreadyExists) {
      res.status(409).json({ errorMessage: errorProfilePhoneNumberAlreadyExists }); // 409 = Conflict
    } else {
      console.error("Database error:", error);
      res.status(500).json({ errorMessage: "Database error adding profile to database." }); // 500 = Internal Server Error
    }
  }
});

/** 
 * Tries to assign a new value to a property of a profile in the database.
 * @param {*} email string.
 * @param {*} password string.
 * @param {*} propertyName string name of the property in the MySQL database.
 * @param {*} newValue the new value of the property.
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function modifyProfile(email, password, propertyName, newValue) {
  //y TODO
}
