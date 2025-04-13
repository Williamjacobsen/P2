import express from "express";
import pool from "../db.js";
import { getProfile } from "./profile.js";
import {
  getErrorCode,
  errorWrongVendorID
} from "../errorMessage.js"

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Router
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const router = express.Router();
export default router;

router.post("/get", async (req, res) => {
  try {
    const { vendorID } = req.body; // Get data from body
    const vendor = await getVendor(vendorID);
    res.status(200).json({ vendor: vendor }); // Send back response
    //y TODO: add variable validation (like "email" needs to be "not null" in database)
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
  }
});

router.post("/modify", async (req, res) => {
  try {
    const { email, password, propertyName, newValue } = req.body; // Get data from body
    console.log("nwah"); //r 
    const vendor = await modifyVendor(email, password, propertyName, newValue);
    console.log(vendor.Email); //r 
    res.status(201).json({ vendor: vendor }); // Send back response
    //y TODO: implement password encryption (right now it is just being sent directly)
    //y TODO: add variable validation (like "email" needs to be "not null" in database)
  } catch (error) {
    res.status(getErrorCode(error)).json({ errorMessage: error });
  }
});

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

async function getVendor(vendorID) {
  // Get an array of vendors with the corresponding ID from the database
  const [vendor] = await pool.query(`SELECT * FROM p2.Vendor WHERE ID='${vendorID}';`);
  // Check that vendor exists
  if (Object.keys(vendor).length === 0) {
    return Promise.reject(errorWrongVendorID);
  }
  // Return vendor
  return vendor[0];
}

/** 
 * Tries to assign a new value to a property of a vendor in the database based on vendor profile credentials.
 * @param {*} email string.
 * @param {*} password string.
 * @param {*} propertyName string name of the property in the MySQL database.
 * @param {*} newValue the new value of the property.
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function modifyVendor(email, password, propertyName, newValue) {
  // Check that profile exists and password is right
  const profile = await getProfile(email, password);
  const vendorID = profile.VendorID;
  // Check that vendor ID exists
  await getVendor(vendorID);
  // Update property with the new value
  await pool.query(`UPDATE p2.Vendor SET ${propertyName}='${newValue}' WHERE (ID='${vendorID}');`);
  // Return profile
  const [updatedVendor] = await pool.query(`SELECT * FROM p2.Vendor WHERE ID='${vendorID}';`);
  return updatedVendor[0];
}