import express from "express";
import pool from "../db.js";

const router = express.Router();

/** Gets all product data with related image paths and store name */

router.get("/:id", async (req, res) => {

    try {
      const { id } = req.params;
  
      const [result] = await pool.query(
        `SELECT 
          p2.Product.*, 
          p2.Vendor.Name,
          p2.ProductImage.Path,
          p2.Vendor.Address,
          p2.ProductSize.*
          FROM p2.Product
          JOIN p2.Vendor ON p2.Product.StoreID = p2.Vendor.ID
          LEFT JOIN p2.ProductImage ON p2.Product.ID = p2.ProductImage.ProductID
          LEFT JOIN p2.ProductSize ON p2.Product.ID = p2.ProductSize.ProductID
          WHERE p2.Product.ID = ?;`,
        [id]
      );
  
      res.status(200).json(result);
    } catch (err) {
      console.error("Error fetching product:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
      
  });

export default router;