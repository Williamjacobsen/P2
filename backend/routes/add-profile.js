import express from "express";
import pool from "../db.js";

const router = express.Router();
export default router;

// Error messages
const errorProfileEmailAlreadyExists = "Another profile already uses that email.";
const errorProfilePhoneNumberAlreadyExists = "Another profile already uses that phone number.";

router.post("/", async (req, res) => {
  try {

    const {
      email,
      password,
      phoneNumber
    } = req.body;

    //y TODO: implement password encryption (right now it is just being sent directly)

    //y TODO: add some variable validation (like "email" needs to be "not null" in database)

    const profile = await addProfile(email, password, phoneNumber);

    res.status(201).json({
      profile: profile
    });
  } catch (error) {
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
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function addProfile(email, password, phoneNumber) {

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