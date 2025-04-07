import express from "express";
import pool from "../db.js";

// Router
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