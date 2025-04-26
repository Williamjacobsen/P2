import express from "express";

import pool from "../db.js";
import { getProfile } from "./profile.js";

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Router
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const router = express.Router();
export default router;
router.post("/getProfileProductOrders", async (req, res) => {
  try {
    // Get data from request
    const accessToken = req.cookies.profileAccessToken;
    // Check that profile exists and password is right
    const profile = await getProfile(res, accessToken);
    const profileID = profile.ID;
    // Get product orders for that profile
    const [profileProductOrderRows] = await pool.query(`SELECT * FROM p2.ProductOrder WHERE CustomerID='${profileID}';`);
    // Send back response
    res.status(200).json({ productOrders: profileProductOrderRows }); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

