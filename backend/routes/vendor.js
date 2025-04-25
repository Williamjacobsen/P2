import express from "express";
import bcrypt from "bcrypt";

import pool from "../db.js";
import { getProfile } from "./profile.js";

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Router
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const router = express.Router();
export default router;

router.post("/get", async (req, res) => {
  try {
    const { vendorID } = req.body; // Get data from body
    // Get vendor
    const vendor = await getVendor(res, vendorID);
    // Send back response
    res.status(200).json({ vendor: vendor }); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

router.post("/modify", async (req, res) => {
  try {
    const { accessToken, password, propertyName, newValue } = req.body; // Get data from body
    // Check that profile exists and password is right
    const profile = await getProfile(res, accessToken);
    const vendorID = profile.VendorID;
    // Verify password
    if (await bcrypt.compare(password, profile.PasswordHash) === false) {
      res.status(401).json({ error: "Password does not match email." }); // 401 = Unauthorized
      return;
    }
    // Check that vendor ID exists
    const vendor = await getVendor(res, vendorID);
    // Update property with the new value
    await pool.query(`UPDATE p2.Vendor SET ${propertyName}='${newValue}' WHERE (ID='${vendorID}');`);
    // Send back response
    res.status(201).json({}); // 201 = Created
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a vendor from the database using a vendor ID.
 * @returns either a JSON object with the vendor (from the MySQL database), 
 * or a Promise.reject with an error message.
 */
async function getVendor(httpResponse, vendorID) {
  // Get an array of vendors with the corresponding ID from the database
  const [vendorRows] = await pool.query(`SELECT * FROM p2.Vendor WHERE ID='${vendorID}';`);
  // Check that vendor exists
  if (Object.keys(vendorRows).length === 0) {
    const error = "Vendor ID does not exist in the database."
    httpResponse.status(404).json({ error: error }); // 404 = Not found
    return Promise.reject(error);
  }
  // Return vendor
  return vendorRows[0];
}