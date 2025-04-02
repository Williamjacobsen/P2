import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // TODO: implement password encryption (right now it is just being sent directly)

    // TODO: add some variable validation (like "email" needs to be "not null" in database)

    // Find customer profile with the input email
    const [profile] = await pool.query(`SELECT * FROM p2.customer WHERE Email = '${email}';`);

    //r not finished

    // Check whether there exists a customer profile with the input email
    if (Object.keys(profile).length == 0) {
      console.log("Fuck") //R
    }
    // Check whether the input password matches the profile's password
    else if (profile[0].Password == password) {
      console.log("Let's gooo") //R
      // res.status(201).json({
      //   message: "Customer profile successfully found.",
      //   profileId: profile[0].ID,
      //   // productId: result.insertId,
      // });
    } else {
      console.log("Double fuck") //R
    }

    res.status(201).json({
      message: "Customer profile successfully found.",
      // profileId: profile.ID,
    });
  }
  catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Error finding customer profile in database." });
  }
});

export default router;