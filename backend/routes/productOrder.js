import express from "express";
import { validationResult } from "express-validator";

import pool from "../db.js";
import { getProfile } from "./profile.js";
import { validateProfileAccessToken } from "../utils/inputValidation.js"

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Router
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const router = express.Router();
export default router;

router.get("/getProfileProductOrders", [
  validateProfileAccessToken
], async (req, res) => {
  try {
    // Handle validation errors
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ error: "Input is invalid." }); // 400 = Bad request
    }
    // Get data from request
    const accessToken = req.cookies.profileAccessToken;
    // Check that profile exists and password is right
    const profile = await getProfile(res, accessToken);
    const profileID = profile.ID;
    // Get product orders for that profile
    const [profileProductOrderRows] = await pool.query(`SELECT * FROM p2.ProductOrder WHERE CustomerID='${profileID}';`);
    // Send back response
    res.set('Cache-Control', 'no-store'); // Prevents caching of the response (for security reasons).
    return res.status(200).json({ productOrders: profileProductOrderRows }); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

