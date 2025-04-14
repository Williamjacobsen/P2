import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

app.use("/uploads", express.static("uploads"));

import productImagesRoute from "./routes/product-images-example-for-martin.js";
app.use("/product-images", productImagesRoute);

import addProductRoute from "./routes/add-product.js";
app.use("/add-product", addProductRoute);

app.get("/test", (req, res) => {
  res.send("API is working!");
});

app.get("/example/get-text", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM p2.example;");
    res.json({ text: rows[0]?.example_text || null });
  } catch (error) {
    console.error("Error fetching text:", error);
    res.status(500).json({ error: "Failed to fetch text" });
  }
});

app.post("/example/save-text", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid text input" });
  }

  try {
    pool.query("DELETE FROM p2.example LIMIT 1;");

    const [result] = await pool.query(
      "INSERT INTO p2.example (example_text) VALUES (?);",
      [text]
    );

    res.json({
      message: "Text saved successfully",
      text,
    });
  } catch (error) {
    console.error("Error saving text:", error);
    res.status(500).json({ error: "Failed to save text" });
  }
});

app.get("/faq", async (req, res) => {
  const [result] = await pool.query("SELECT * FROM p2.faq;");
  res.status(200).json(result);
});

/** Gets all product data with related image paths and store name */
app.get("/product/:id", async (req, res) => {
  try{
    const { id } = req.params;

    const [result] = await pool.query(
        `SELECT 
        p2.Product.*, 
        p2.Vendor.Name AS StoreName, 
        p2.productimage.Path
        FROM p2.Product
        JOIN p2.Vendor ON p2.Product.StoreID = p2.Vendor.ID
        LEFT JOIN p2.ProductImage ON p2.Product.ID = p2.ProductImage.ProductID
        WHERE p2.Product.ID = ?;`,
        [id]
      );
    res.status(200).json(result);
  }
  catch (err){
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/products", async (req, res) => {
  try{
    const [result] = await pool.query(`
      SELECT p2.product.*, p2.store.Name AS StoreName
      FROM p2.product
      JOIN p2.store ON p2.product.StoreID = p2.store.ID;
    `);
    res.status(200).json(result);
  }
  catch (err){
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
