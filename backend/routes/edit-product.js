import express from "express";
import pool from "../db.js";
import fs from "fs";
import multer from "multer";
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

router.get("/get/:id", validateProfileAccessToken, async (req, res) => {
  try {
    const productId = req.params.id;

    handleValidationErrors(req, res, validationResult);
    const accessToken = req.cookies.profileAccessToken;
    const profile = await getProfile(res, accessToken);

    if (!profile.VendorID) {
      throw new Error("User is not a Vendor");
    }

    const [productRows] = await pool.query(
      `SELECT Product.*, Vendor.Name AS VendorName
       FROM Product
       JOIN Vendor ON Product.StoreID = Vendor.ID
       WHERE Product.ID = ? AND Product.StoreID = ?`,
      [productId, profile.VendorID]
    );
    const product = productRows[0];
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [sizeRows] = await pool.query(
      "SELECT Size, Stock FROM ProductSize WHERE ProductID = ?",
      [productId]
    );

    const [imageRows] = await pool.query(
      "SELECT Path FROM ProductImage WHERE ProductID = ?",
      [productId]
    );

    res.status(200).json({
      product: {
        ...product,
        sizes: sizeRows,
        images: imageRows.map((r) => r.Path),
      },
    });
  } catch (error) {
    console.error(`Error fetching product:`, error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error fetching product" });
    }
  }
});

router.put(
  "/edit/:id",
  validateProfileAccessToken,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const productId = req.params.id;

      handleValidationErrors(req, res, validationResult);
      const accessToken = req.cookies.profileAccessToken;
      const profile = await getProfile(res, accessToken);

      if (!profile.VendorID) {
        throw new Error("User is not a Vendor");
      }

      const {
        name,
        price,
        discountProcent,
        description,
        clothingType,
        brand,
        gender,
      } = req.body;

      await pool.query(
        `UPDATE Product SET Name = ?, Price = ?, DiscountProcent = ?, Description = ?, ClothingType = ?, Brand = ?, Gender = ? WHERE ID = ? AND StoreID = ?`,
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

      await pool.query("DELETE FROM ProductSize WHERE ProductID = ?", [
        productId,
      ]);

      const sizes = ensureArray(req.body.size);
      const stocks = ensureArray(req.body.stock);

      for (let i = 0; i < sizes.length; i++) {
        await pool.query(
          "INSERT INTO ProductSize (ProductID, Size, Stock) VALUES (?, ?, ?)",
          [productId, sizes[i], stocks[i]]
        );
      }

      const existing = req.body.existingImages || [];
      const existingImages = ensureArray(existing);

      const [currentRows] = await pool.query(
        `SELECT Path FROM p2.ProductImage WHERE ProductID = ?`,
        [productId]
      );
      const currentPaths = currentRows.map((row) => row.Path);

      const toDelete = currentPaths.filter(
        (path) => !existingImages.includes(path)
      );

      for (const imgPath of toDelete) {
        const fullPath = path.resolve(__dirname, "../uploads", imgPath);
        fs.unlink(fullPath, (err) => {
          if (err) console.warn(`Failed to delete file ${fullPath}:`, err);
        });
        await pool.query(
          `DELETE FROM p2.ProductImage WHERE ProductID = ? AND Path = ?`,
          [productId, imgPath]
        );
      }

      if (req.files && req.files.length > 0) {
        const insertPromises = req.files.map((file) => {
          const imageUrl = `http://localhost:3001/uploads/${file.filename}`;
          return pool.query(
            `INSERT INTO p2.ProductImage (ProductID, Path) VALUES (?, ?)`,
            [productId, imageUrl]
          );
        });
        await Promise.all(insertPromises);
      }

      const [rows] = await pool.query("SELECT * FROM Product WHERE ID = ?", [
        productId,
      ]);

      res.status(200).json({
        message: "Product edited successfully",
        updatedProduct: rows[0],
      });
    } catch (error) {
      console.error(`Error editing product:`, error);
      if (!res.headersSent)
        res.status(500).json({ message: "Error editing product" });
    }
  }
);

export default router;
