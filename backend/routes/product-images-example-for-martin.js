import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const [rows] = await pool.query(
      "SELECT Path FROM p2.ProductImage WHERE ProductID = ?",
      [productId]
    );

    res.status(200).json({ images: rows.map((row) => row.Path) });
  } catch (error) {
    res.status(500);
  }
});

router.get("/:productId/primary", async (req, res) => {
  try {
    const { productId } = req.params;

    const [rows] = await pool.query(
      "SELECT Path FROM p2.ProductImage WHERE ProductID = ? LIMIT 1",
      [productId]
    );

    const path = rows[0]?.Path || null;

    res.status(200).json({ path });
  } catch (error) {
    console.error("Error fetching primary image:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
