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

    console.log("image path:");
    console.log(process.env.BACKEND_URL);

    if (req.files.length != 0) {
      for (const file of req.files) {
        const imageUrl = `${process.env.BACKEND_URL}/uploads/${file.filename}`;
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
    res.status(500).send(error);
  }
});

export default router;
