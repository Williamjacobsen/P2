import express from "express";
import pool from "../db.js";

const router = express.Router();

const errorWrongEmail = "The inputted email does not exist in the profile database.";
const errorWrongPassword = "The inputted password does not match the inputted email.";

router.post("/", async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    const profile = await TryGetCustomerProfile();

    //y TODO: implement password encryption (right now it is just being sent directly)

    //y TODO: add some variable validation (like "email" needs to be "not null" in database)

    res.status(201).json({
      message: "Customer profile successfully found.",
      profile: profile
    });
  } catch (error) {
    if (error === errorWrongEmail) {
      res.status(404).json({ message: "Email does not have an associated profile." });
    } else if (error === errorWrongPassword) {
      res.status(401).json({ message: "Password does not match email." });
    } else {
      console.log("coick 2: the reckoning"); //r
      console.error("Database error:", error);
      res.status(500).json({ message: "Database error finding customer profile in database." });
    }
  }
});

/**
 * Gets a customer profile in the database using email and password.
 * @param {*} email 
 * @param {*} password 
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function TryGetCustomerProfile(email, password) {

  // Get an array of profiles with the corresponding email from the database
  const [profile] = await pool.query(`SELECT * FROM p2.customer WHERE Email = '${email}';`);

  if (Object.keys(profile).length == 0) {
    return Promise.reject(errorWrongEmail);
  } else if (profile[0].Password != password) {
    return Promise.reject(errorWrongPassword);
  }
  return profile[0];
}

export default router;