import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT p2.Product.*, p2.Vendor.Name AS StoreName
      FROM p2.Product
      JOIN p2.Vendor ON p2.Product.StoreID = p2.Vendor.ID;
    `);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;
