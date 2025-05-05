import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT p2.product.*, p2.vendor.Name AS StoreName
      FROM p2.product
      JOIN p2.vendor ON p2.product.StoreID = p2.vendor.ID;
    `);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;