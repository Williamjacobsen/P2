import express from "express";
import pool from "../db.js";

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

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Error messages
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const errorWrongVendorID = "Vendor ID does not exist."

function getErrorCode(errorMessage) {
  switch (errorMessage) {
    case errorWrongVendorID: return 404; // 404 = Not Found
    default: return 500; // 500 = Internal Server Error
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

async function getVendor(vendorID) {
  // Get an array of vendors with the corresponding ID from the database
  const [vendor] = await pool.query(`SELECT * FROM p2.Vendor WHERE ID='${vendorID}';`);
  // Check that vendor exists
  if (Object.keys(vendor).length == 0) {
    return Promise.reject(errorWrongVendorID);
  }
  // Return vendor
  return vendor[0];
}