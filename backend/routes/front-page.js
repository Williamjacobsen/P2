import express from "express";
import pool from "../db.js";

const router = express.Router();
export default router;

router.get("/best-sellers", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM p2.Productstatistics ORDER BY AmountSold DESC;"
    );
    res.json(rows.slice(0, 4));
  } catch (error) {
    console.error("Error fetching productstatistics:", error);
    res.status(500).json({ error: "Failed to fetch productstatistics" });
  }
});

router.get("/shop-circles", async (req, res) => {
  try {
    const [result] = await pool.query(`
        SELECT * FROM Vendor
        LIMIT 25
    `);
    res.status(200).json(result);
  } catch (err) {
    console.log("Error in database query for shopcircles", err);
    res.status(500).json({ error: "Failed to fetch ShopCircles" });
  }
});
