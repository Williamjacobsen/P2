import express from "express";
import pool from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { validationResult } from "express-validator";
import {
  handleValidationErrors,
  validateProfileAccessToken,
} from "../utils/inputValidation.js";
import { getProfile } from "./profile.js";

console.log("delete-product: 1 - Imports loaded");

const router = express.Router();
console.log("delete-product: 2 - Express router created");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("delete-product: 3 - __filename and __dirname resolved");

router.delete("/:id", validateProfileAccessToken, async (req, res) => {
  console.log("delete-product: DELETE /:id - Incoming request");

  try {
    const productId = req.params.id;
    console.log("delete-product: Target productId:", productId);

    handleValidationErrors(req, res, validationResult);
    const accessToken = req.cookies.profileAccessToken;
    const profile = await getProfile(res, accessToken);

    console.log("delete-product: Retrieved profile:", profile);

    if (!profile.VendorID) {
      console.log("delete-product: User is not a Vendor");
      throw new Error("User is not a Vendor");
    }

    console.log("delete-product: Fetching product images from DB...");
    const [images] = await pool.query(
      `SELECT Path FROM p2.ProductImage WHERE ProductID = ?`,
      [productId]
    );

    console.log("delete-product: Deleting related ProductImage rows...");
    await pool.query(`DELETE FROM p2.ProductImage WHERE ProductID = ?`, [
      productId,
    ]);

    console.log("delete-product: Deleting related ProductSize rows...");
    await pool.query(`DELETE FROM p2.ProductSize WHERE ProductID = ?`, [
      productId,
    ]);

    console.log("delete-product: Deleting Product row...");
    const [result] = await pool.query(`DELETE FROM p2.Product WHERE ID = ?`, [
      productId,
    ]);

    if (result.affectedRows === 0) {
      console.log("delete-product: No product found to delete");
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("delete-product: Attempting to delete image files...");
    for (const row of images) {
      try {
        const fileUrl = row.Path;
        const filename = path.basename(fileUrl);
        const safeFilename = filename.replace(/\s+/g, "_").replace(/#/g, "");
        const filePath = path.join(__dirname, "../uploads", safeFilename);

        console.log("delete-product: Checking if file exists:", filePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("delete-product: Deleted file:", filePath);
        } else {
          console.log("delete-product: File not found, skipping:", filePath);
        }
      } catch (fsErr) {
        console.error(
          `delete-product: Failed to delete file for product ${productId}:`,
          fsErr
        );
      }
    }

    console.log("delete-product: Product deletion successful");
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(
      `delete-product: Error deleting product ${productId}:`,
      error
    );
    if (res._header === null) {
      res.status(500).json({ message: "Error deleting product" });
    }
  }
});

console.log("delete-product: 4 - DELETE route configured");

export default router;
