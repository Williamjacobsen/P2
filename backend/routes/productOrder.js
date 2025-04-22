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
    // Get data from body
    const { accessToken } = req.body;
    // Check that profile exists and password is right
    const profile = await getProfile(res, accessToken);
    if (profile === undefined) {
      return;
    }
    const profileID = profile.ID;
    // Get product orders for that profile
    const [profileProductOrderRows] = await pool.query(`SELECT * FROM p2.ProductOrder WHERE CustomerID='${profileID}';`);
    // Send back response
    res.status(200).json({ productOrders: profileProductOrderRows }); // 200 = OK
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
});

