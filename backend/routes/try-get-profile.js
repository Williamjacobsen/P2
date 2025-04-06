import express from "express";
import pool from "../db.js";

const router = express.Router();

// Error messages
const errorWrongEmail = "Email does not have a profile.";
const errorWrongPassword = "Password does not match email.";

router.post("/", async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    const profile = await tryGetProfile(email, password);

    //y TODO: implement password encryption (right now it is just being sent directly)

    //y TODO: add some variable validation (like "email" needs to be "not null" in database)

    res.status(201).json({
      profile: profile
    });
  } catch (error) {
    if (error === errorWrongEmail) {
      res.status(404).json({ errorMessage: errorWrongEmail });
    } else if (error === errorWrongPassword) {
      res.status(401).json({ errorMessage: errorWrongPassword });
    } else {
      console.error("Database error:", error);
      res.status(500).json({ errorMessage: "Database error finding profile in database." });
    }
  }
});

/**
 * Tries to get a profile in the database using email and password.
 * @param {*} email 
 * @param {*} password 
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function tryGetProfile(email, password) {

  // Get an array of profiles with the corresponding email from the database
  const [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Email = '${email}';`);

  if (Object.keys(profile).length == 0) {
    return Promise.reject(errorWrongEmail);
  } else if (profile[0].Password != password) {
    return Promise.reject(errorWrongPassword);
  }
  return profile[0];
}

export default router;