import express from "express";
import pool from "../db.js";
import { getProfile } from "./profile.js";
import bcrypt from "bcrypt";
import {
  getErrorCode,
  errorWrongVendorID,
  errorWrongPassword
} from "../errorMessage.js"

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Router
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const router = express.Router();
export default router;

router.post("/get", async (req, res) => {
  try {
    const { vendorID } = req.body; // Get data from body
    // Get vendor
    const vendor = await getVendor(vendorID);
    // Send back response
    res.status(200).json({ vendor: vendor }); // 200 = OK
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
  }
});

router.post("/modify", async (req, res) => {
  try {
    const { accessToken, password, propertyName, newValue } = req.body; // Get data from body
    // Check that profile exists and password is right
    const profile = await getProfile(accessToken);
    const vendorID = profile.VendorID;
    // Verify password
    if (await bcrypt.compare(password, profile.PasswordHash) === false) {
      throw Error(errorWrongPassword);
    }
    // Check that vendor ID exists
    await getVendor(vendorID);
    // Update property with the new value
    await pool.query(`UPDATE p2.Vendor SET ${propertyName}='${newValue}' WHERE (ID='${vendorID}');`);
    // Return profile
    const [updatedVendorRows] = await pool.query(`SELECT * FROM p2.Vendor WHERE ID='${vendorID}';`);
    // Send back response
    res.status(201).json({ vendor: updatedVendorRows[0] }); // 201 Created
  } catch (error) {
    console.log(error);
    res.status(getErrorCode(error)).json({ errorMessage: error });
  }
});

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a vendor from the database using a vendor ID.
 * @returns either a JSON object with the vendor (from the MySQL database), or a Promise.reject() with an error message.
 */
async function getVendor(vendorID) {
  // Get an array of vendors with the corresponding ID from the database
  const [vendorRows] = await pool.query(`SELECT * FROM p2.Vendor WHERE ID='${vendorID}';`);
  // Check that vendor exists
  if (Object.keys(vendorRows).length === 0) {
    return Promise.reject(errorWrongVendorID);
  }
  // Return vendor
  return vendorRows[0];
}