import dotenv from "dotenv";
console.log("delete-product: 1 - Loading environment variables");
dotenv.config();

import express from "express";
import pool from "../db.js";
import { fileURLToPath } from "url";
import path from "path";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { validationResult } from "express-validator";
import {
  handleValidationErrors,
  validateProfileAccessToken,
} from "../utils/inputValidation.js";
import { getProfile } from "./profile.js";

console.log("delete-product: 2 - Imported libraries");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});
console.log("delete-product: 3 - S3 Client created");

const router = express.Router();
console.log("delete-product: 4 - Express router created");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("__filename:", __filename);
console.log("__dirname:", __dirname);

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
console.log("delete-product: 5 - AWS Bucket name:", BUCKET_NAME);

router.delete("/:id", validateProfileAccessToken, async (req, res) => {
  console.log(
    "delete-product: DELETE /:id - Received request for ProductID =",
    req.params.id
  );
  try {
    console.log("delete-product: Validating request...");
    handleValidationErrors(req, res, validationResult);

    const accessToken = req.cookies.profileAccessToken;
    console.log("delete-product: Access token from cookies:", accessToken);

    const profile = await getProfile(res, accessToken);
    console.log("delete-product: Fetched profile:", profile);

    if (!profile.VendorID) {
      console.log("delete-product: User is not a Vendor, aborting");
      throw new Error("User is not a Vendor");
    }

    const productId = req.params.id;
    console.log("delete-product: Deleting product with ID =", productId);

    console.log("delete-product: Fetching image paths from database");
    const [images] = await pool.query(
      `SELECT Path FROM p2.ProductImage WHERE ProductID = ?`,
      [productId]
    );
    console.log("delete-product: Retrieved images:", images);

    console.log("delete-product: Deleting image records from ProductImage");
    await pool.query(`DELETE FROM p2.ProductImage WHERE ProductID = ?`, [
      productId,
    ]);

    console.log("delete-product: Deleting size records from ProductSize");
    await pool.query(`DELETE FROM p2.ProductSize WHERE ProductID = ?`, [
      productId,
    ]);

    console.log(
      "delete-product: Deleting statistics records from productstatistics"
    );
    await pool.query(`DELETE FROM p2.Productstatistics WHERE ProductID = ?`, [
      productId,
    ]);

    console.log("delete-product: Deleting product record from Product table");
    const [result] = await pool.query(`DELETE FROM p2.Product WHERE ID = ?`, [
      productId,
    ]);

    if (result.affectedRows === 0) {
      console.log("delete-product: No rows affected, product not found");
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("delete-product: Deleting files from S3");
    for (const row of images) {
      try {
        const fileUrl = row.Path;
        const filename = path.basename(fileUrl);
        const safeFilename = filename.replace(/\s+/g, "_").replace(/#/g, "");
        console.log(
          `delete-product: Deleting S3 object with key ${safeFilename}`
        );
        await s3.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: safeFilename,
          })
        );
        console.log(
          `delete-product: Successfully deleted S3 object ${safeFilename}`
        );
      } catch (s3Err) {
        console.error(
          `delete-product: Failed to delete S3 object for product ${productId}:`,
          s3Err
        );
      }
    }

    console.log("delete-product: Sending success response");
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(
      `delete-product: Error deleting product ${req.params.id}:`,
      error
    );
    if (res._header === null) {
      res.status(500).json({ message: "Error deleting product" });
    }
  }
});

console.log("delete-product: Router DELETE route configured");

export default router;
