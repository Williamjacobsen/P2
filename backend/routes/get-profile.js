import express from "express";
import pool from "../db.js";

// Router
const router = express.Router();
export default router;

// Error messages
const errorWrongEmail = "Email does not have a profile.";
const errorWrongPassword = "Password does not match email.";

router.post("/", async (req, res) => {
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