import express from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

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
    /* 
      \s+ matches one or more whitespace chars
      g means global, so instead of replacing the first one, it replaces everyone
      /#/ matches '#'
      */
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

const upload = multer({ storage, fileFilter });

router.post("/", upload.array("images", 10), async (req, res) => {
  try {
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
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
          file.filename
        }`;
        imageUrls.push(imageUrl);

        await pool.query(
          `INSERT INTO p2.ProductImage (ProductID, Path)
           VALUES (?, ?)`,
          [productId, imageUrl]
        );
      }
    }

    res.status(201).json({
      message: "Product added successfully",
      productId,
      imageUrls,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Error adding product to database" });
  }
});

export default router;
