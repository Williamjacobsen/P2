import dotenv from "dotenv";
console.log("product-route: 1 - Loading environment variables");
dotenv.config();

import express from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { validationResult } from "express-validator";
import {
  handleValidationErrors,
  validateProfileAccessToken,
} from "../utils/inputValidation.js";
import { getProfile } from "./profile.js";

console.log("product-route: 2 - Imported libraries");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});
console.log("product-route: 3 - S3 Client created");

const router = express.Router();
console.log("product-route: 4 - Express router created");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("__filename:", __filename);
console.log("__dirname:", __dirname);

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const CLOUDFRONT_URL = process.env.CLOUD_FRONT_URL;
console.log("product-route: 5 - AWS Bucket name:", BUCKET_NAME);
console.log("product-route: 6 - CloudFront URL:", CLOUDFRONT_URL);

// Multer memory storage for S3 uploads
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};
const upload = multer({ storage, fileFilter });
console.log("product-route: 7 - Multer upload middleware configured");

const ensureArray = (val) => {
  console.log("ensureArray - input value:", val);
  if (Array.isArray(val)) return val;
  if (val != null) return [val];
  return [];
};
console.log("product-route: 8 - ensureArray function created");

// GET product by ID
router.get("/get/:id", validateProfileAccessToken, async (req, res) => {
  console.log("product-route: GET /get/:id - ProductID =", req.params.id);
  try {
    handleValidationErrors(req, res, validationResult);
    const accessToken = req.cookies.profileAccessToken;
    console.log("product-route: Access token:", accessToken);
    const profile = await getProfile(res, accessToken);
    console.log("product-route: Fetched profile:", profile);
    if (!profile.VendorID) {
      console.log("product-route: User is not a Vendor");
      throw new Error("User is not a Vendor");
    }
    const productId = req.params.id;
    console.log("product-route: Querying product record");
    const [productRows] = await pool.query(
      `SELECT Product.*, Vendor.Name AS VendorName
       FROM p2.Product
       JOIN p2.Vendor ON Product.StoreID = Vendor.ID
       WHERE Product.ID = ? AND Product.StoreID = ?`,
      [productId, profile.VendorID]
    );
    const product = productRows[0];
    if (!product) {
      console.log("product-route: Product not found");
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("product-route: Querying sizes and images");
    const [sizeRows] = await pool.query(
      "SELECT Size, Stock FROM p2.ProductSize WHERE ProductID = ?",
      [productId]
    );
    const [imageRows] = await pool.query(
      "SELECT Path FROM p2.ProductImage WHERE ProductID = ?",
      [productId]
    );
    console.log("product-route: Sending product data");
    res.status(200).json({
      product: {
        ...product,
        sizes: sizeRows,
        images: imageRows.map((r) => r.Path),
      },
    });
  } catch (error) {
    console.error("product-route: Error fetching product:", error);
    if (!res.headersSent)
      res.status(500).json({ message: "Error fetching product" });
  }
});

// EDIT product by ID
router.put(
  "/edit/:id",
  validateProfileAccessToken,
  upload.array("images", 10),
  async (req, res) => {
    console.log("product-route: PUT /edit/:id - ProductID =", req.params.id);
    try {
      handleValidationErrors(req, res, validationResult);
      const accessToken = req.cookies.profileAccessToken;
      console.log("product-route: Access token:", accessToken);
      const profile = await getProfile(res, accessToken);
      console.log("product-route: Fetched profile:", profile);
      if (!profile.VendorID) {
        console.log("product-route: User is not a Vendor");
        throw new Error("User is not a Vendor");
      }
      const productId = req.params.id;
      console.log("product-route: Updating product fields");
      const {
        name,
        price,
        discountProcent,
        description,
        clothingType,
        brand,
        gender,
      } = req.body;
      console.log("product-route: Parsed fields:", {
        name,
        price,
        discountProcent,
        description,
        clothingType,
        brand,
        gender,
      });
      await pool.query(
        `UPDATE p2.Product SET Name = ?, Price = ?, DiscountProcent = ?, Description = ?, ClothingType = ?, Brand = ?, Gender = ? WHERE ID = ? AND StoreID = ?`,
        [
          name,
          price,
          discountProcent,
          description,
          clothingType,
          brand,
          gender,
          productId,
          profile.VendorID,
        ]
      );
      console.log("product-route: Deleted old size records");
      await pool.query("DELETE FROM p2.ProductSize WHERE ProductID = ?", [
        productId,
      ]);
      const sizes = ensureArray(req.body.size);
      const stocks = ensureArray(req.body.stock);
      console.log("product-route: Inserting sizes and stocks", {
        sizes,
        stocks,
      });
      for (let i = 0; i < sizes.length; i++) {
        await pool.query(
          "INSERT INTO p2.ProductSize (ProductID, Size, Stock) VALUES (?, ?, ?)",
          [productId, sizes[i], parseInt(stocks[i], 10)]
        );
      }
      // Handle existing images
      const existingImages = ensureArray(req.body.existingImages);
      console.log("product-route: Existing images to keep:", existingImages);
      const [currentRows] = await pool.query(
        `SELECT Path FROM p2.ProductImage WHERE ProductID = ?`,
        [productId]
      );
      const currentPaths = currentRows.map((r) => r.Path);
      const toDelete = currentPaths.filter((p) => !existingImages.includes(p));
      console.log("product-route: Images to delete from S3 and DB:", toDelete);
      for (const imgPath of toDelete) {
        try {
          const filename = path.basename(imgPath);
          const safeKey = filename.replace(/\s+/g, "_").replace(/#/g, "");
          console.log(`product-route: Deleting S3 object ${safeKey}`);
          await s3.send(
            new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: safeKey })
          );
          console.log(`product-route: Deleted S3 object ${safeKey}`);
          await pool.query(
            `DELETE FROM p2.ProductImage WHERE ProductID = ? AND Path = ?`,
            [productId, imgPath]
          );
          console.log(`product-route: Removed DB record for ${imgPath}`);
        } catch (err) {
          console.error(`product-route: Error deleting image ${imgPath}:`, err);
        }
      }
      // Upload new files
      if (req.files && req.files.length) {
        console.log("product-route: Uploading new images to S3");
        for (const file of req.files) {
          const safeKey = `${Date.now()}-${file.originalname
            .replace(/\s+/g, "_")
            .replace(/#/g, "")}`;
          console.log(`product-route: Uploading ${safeKey}`);
          await s3.send(
            new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: safeKey,
              Body: file.buffer,
              ContentType: file.mimetype,
            })
          );
          const imageUrl = `${CLOUDFRONT_URL}/${safeKey}`;
          console.log(`product-route: Saving image URL to DB: ${imageUrl}`);
          await pool.query(
            `INSERT INTO p2.ProductImage (ProductID, Path) VALUES (?, ?)`,
            [productId, imageUrl]
          );
        }
      } else {
        console.log("product-route: No new image files to upload");
      }
      // Fetch updated product
      console.log("product-route: Fetching updated product");
      const [rows] = await pool.query("SELECT * FROM p2.Product WHERE ID = ?", [
        productId,
      ]);
      console.log("product-route: Sending success response");
      res
        .status(200)
        .json({
          message: "Product edited successfully",
          updatedProduct: rows[0],
        });
    } catch (error) {
      console.error("product-route: Error editing product:", error);
      if (!res.headersSent)
        res.status(500).json({ message: "Error editing product" });
    }
  }
);

console.log("product-route: Router GET and PUT routes configured");

export default router;
