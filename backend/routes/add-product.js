import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
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

    // todo: add some variable validation (like "name" needs to be "not null" in database)

    const [result] = await pool.query(
      `INSERT INTO p2.product 
      (StoreId, Name, Price, DiscountProcent, Description, ClothingType, Brand, Gender)
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

    res.status(201).json({
      message: "Product added successfully",
      productId: result.insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Error adding product to database" });
  }
});

export default router;
