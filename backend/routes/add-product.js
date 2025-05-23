import express from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import { validationResult } from "express-validator";
import {
  handleValidationErrors,
  validateProfileAccessToken,
  validateAddProduct,
} from "../utils/inputValidation.js";
import { getProfile } from "./profile.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const safeFilename = file.originalname
      .replace(/\s+/g, "_")
      .replace(/#/g, "");
    cb(null, `${Date.now()}-${safeFilename}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const ensureArray = (val) => {
  if (Array.isArray(val)) {
    return val;
  }
  if (val != null) {
    return [val];
  }
  return [];
};

const upload = multer({ storage, fileFilter });

router.post(
  "/",
  validateProfileAccessToken,
  upload.array("images", 10),
  ...validateAddProduct,
  async (req, res) => {
    try {
      handleValidationErrors(req, res, validationResult);
      const accessToken = req.cookies.profileAccessToken;
      const profile = await getProfile(res, accessToken);

      if (!profile.VendorID) {
        throw new Error("User is not a Vendor");
      }

      const {
        storeID,
        name,
        price,
        discountProcent,
        description,
        clothingType,
        brand,
        gender,
      } = req.body;

      const [result] = await pool.query(
        `INSERT INTO p2.Product
         (StoreID, Name, Price, DiscountProcent, Description, ClothingType, Brand, Gender)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          storeID,
          name,
          price,
          discountProcent,
          description,
          clothingType,
          brand,
          gender,
        ]
      );

      const productId = result.insertId;

      if (req.files.length != 0) {
        for (const file of req.files) {
          const imageUrl = `http://localhost:3001/uploads/${file.filename}`;
          await pool.query(
            `INSERT INTO p2.ProductImage (ProductID, Path) VALUES (?, ?)`,
            [productId, imageUrl]
          );
        }
      }

      const sizes = ensureArray(req.body.size);
      const stocks = ensureArray(req.body.stock);

      for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        const stock = parseInt(stocks[i]);
        await pool.query(
          `INSERT INTO p2.ProductSize (ProductID, Size, Stock) VALUES (?, ?, ?)`,
          [productId, size, stock]
        );
      }

      res.status(201).json({
        message: "Product added successfully",
        productId,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      if (res._header === null) {
        res.status(500).json({ message: error });
      }
    }
  }
);

export default router;
