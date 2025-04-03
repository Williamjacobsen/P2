import express from "express";
import pool from "../db.js";

const router = express.Router();

const errorWrongUsername = "The inputted username does not exist in the profile database.";
const errorWrongPassword = "The inputted password does not match the inputted username.";

router.post("/", async (req, res) => {
  try {

    const {
      username,
      password,
    } = req.body;

    const profile = await TryGetProfile(username, password);

    //y TODO: implement password encryption (right now it is just being sent directly)

    //y TODO: add some variable validation (like "username" needs to be "not null" in database)

    res.status(201).json({
      message: "Profile successfully found.",
      profile: profile
    });
  } catch (error) {
    if (error === errorWrongUsername) {
      res.status(404).json({ message: "Username does not have an associated profile." });
    } else if (error === errorWrongPassword) {
      res.status(401).json({ message: "Password does not match username." });
    } else {
      console.error("Database error:", error);
      res.status(500).json({ message: "Database error finding profile in database." });
    }
  }
});

/**
 * Tries to get a profile in the database using username and password.
 * @param {*} username 
 * @param {*} password 
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function TryGetProfile(username, password) {

  // Get an array of profiles with the corresponding username from the database
  const [profile] = await pool.query(`SELECT * FROM p2.Profile WHERE Username = '${username}';`);

  if (Object.keys(profile).length == 0) {
    return Promise.reject(errorWrongUsername);
  } else if (profile[0].Password != password) {
    return Promise.reject(errorWrongPassword);
  }
  return profile[0];
}

export default router;