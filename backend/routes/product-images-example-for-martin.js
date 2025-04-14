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

export default router;
