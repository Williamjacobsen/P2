import express from "express";
import pool from "../db.js";
import { getProfile } from "./profile.js";
import {
  getErrorCode,
} from "../errorMessage.js"

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Router
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const router = express.Router();
export default router;
router.post("/getProfileProductOrders", async (req, res) => {
  try {
    const { email, password } = req.body; // Get data from body
    const productOrders = await getProfileProfileOrders(email, password);
    res.status(200).json({ productOrders: productOrders }); // Send back response
    //y TODO: implement password encryption (right now it is just being sent directly)
    //y TODO: add variable validation (like "email" needs to be "not null" in database)
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
  }
});

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * @param {*} email string
 * @param {*} password string
 * @returns either an array of JSON objects with orders, or a Promise.reject() with an error message.
 */
export async function getProfileProfileOrders(email, password) {
  // Check that profile exists and password is right
  const profile = await getProfile(email, password);
  const profileID = profile.ID;
  // Get product orders for that profile
  const [profileProductOrders] = await pool.query(`SELECT * FROM p2.ProductOrder WHERE CustomerID='${profileID}';`);
  return profileProductOrders;
}
