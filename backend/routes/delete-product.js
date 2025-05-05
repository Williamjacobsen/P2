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

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.delete("/:id", validateProfileAccessToken, async (req, res) => {
  try {
    console.log("a");
    handleValidationErrors(req, res, validationResult);
    const accessToken = req.cookies.profileAccessToken;
    const profile = await getProfile(res, accessToken);

    if (!profile.VendorID) {
      throw new Error("User is not a Vendor");
    }

    console.log("b");

    const productId = req.params.id;

    console.log("c");

    const [images] = await pool.query(
      `SELECT Path FROM p2.ProductImage WHERE ProductID = ?`,
      [productId]
    );

    console.log("d");

    await pool.query(`DELETE FROM p2.ProductImage WHERE ProductID = ?`, [
      productId,
    ]);

    console.log("e");

    await pool.query(`DELETE FROM p2.ProductSize WHERE ProductID = ?`, [
      productId,
    ]);

    console.log("f");

    const [result] = await pool.query(`DELETE FROM p2.Product WHERE ID = ?`, [
      productId,
    ]);

    console.log("g");

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    for (const row of images) {
      try {
        const fileUrl = row.Path;
        const filename = path.basename(fileUrl);
        const safeFilename = filename.replace(/\s+/g, "_").replace(/#/g, "");
        const filePath = path.join(__dirname, "../uploads", safeFilename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fsErr) {
        console.error(`Failed to delete file for product ${productId}:`, fsErr);
      }
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    if (res._header === null) {
      res.status(500).json({ message: "Error deleting product" });
    }
  }
});

export default router;
