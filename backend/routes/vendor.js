import express from "express";
import bcrypt from "bcrypt";
import { validationResult, check } from "express-validator";

import pool from "../db.js";
import { getProfile } from "./profile.js";
import {
  handleValidationErrors,
  validatePassword,
  validateProfileAccessToken,
  validateVendorID,
  validateVendorPropertyName,
  validateVendorNewValue_Part1Of2,
  validateVendorNewValue_Part2Of2
} from "../utils/inputValidation.js"

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Routes
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const router = express.Router();
export default router;

router.get("/get", [
  validateVendorID
], async (req, res) => {
  try {
    // Handle validation errors
    handleValidationErrors(req, res, validationResult);
    // Get data from request
    const {
      vendorID
    } = req.query;
    // Get vendor
    const vendor = await getVendor(res, vendorID);
    // Send back response
    return res.status(200).json({ vendor: vendor }); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

router.get("/get-all", async (req, res) => {
  try {
    // Get all vendors
    const [vendorRows] = await pool.query(`SELECT * FROM p2.Vendor;`);
    // Send back response
    return res.status(200).json({ vendors: vendorRows }); // 200 = OK
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

router.put("/modify", [
  validatePassword,
  validateVendorPropertyName,
  validateVendorNewValue_Part1Of2, // This does not take into account the property name.
  validateProfileAccessToken
], async (req, res) => {
  try {
    // Handle validation errors
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ error: "Input is invalid for the input: '" + validationErrors.array()[0].path + "'" }); // 400 = Bad request
    }
    // Get data from request
    const {
      password,
      propertyName,
      newValue
    } = req.body;
    const accessToken = req.cookies.profileAccessToken;
    // Do additional validation for the newValue depending on the propertyName
    validateVendorNewValue_Part2Of2(res, propertyName, newValue);
    // Check that profile exists and password is right
    const profile = await getProfile(res, accessToken);
    const vendorID = profile.VendorID;
    // Verify password
    if (await bcrypt.compare(password, profile.PasswordHash) === false) {
      return res.status(401).json({ error: "Password does not match email." }); // 401 = Unauthorized
    }
    // Check that vendor ID exists
    await getVendor(res, vendorID);
    // Update property with the new value
    await pool.query(`UPDATE p2.Vendor SET ${propertyName}='${newValue}' WHERE (ID='${vendorID}');`);
    // Send back response
    return res.status(201).json({}); // 201 = Created
  } catch (error) {
    if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
      return res.status(500).json({ error: "Internal server error: " + error });
    }
  }
});

router.get("/vendor-products/:vendorid", [
  // I'd have used the validateVendorID export from inputValidation.js,
  // but the person who wrote this route used the name "vendorid" instead of "vendorID". Oh well...
  check("vendorid")
    .bail()
    .escape()
    .notEmpty()
    .isInt()
], async (req, res) => {
  // Handle validation errors
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ error: "Input is invalid for the input: '" + validationErrors.array()[0].path + "'" }); // 400 = Bad request
  }

  const { vendorid } = req.params; // VendorID is grabbed from the url parameter

  if (vendorid <= 0) {
    return res.status(400).json({ message: "Vendor ID must be a positive integer" });
  }

  try {
    const [result] = await pool.query(
      `
      SELECT p2.Product.*, p2.Vendor.Name AS StoreName
      FROM p2.Product
             JOIN p2.Vendor ON p2.Product.StoreID = p2.Vendor.ID
      WHERE p2.Product.StoreID = ?
    `,
      [vendorid]
    ); // Use parameterized query to safely inject vendorid
    res.status(200).json(result);
  } catch (err) {
    console.log("error in database query for vendorproducts", err);
    res.status(500).json({ message: "Internal server error" });
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