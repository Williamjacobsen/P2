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
import profileRoute from "./routes/profile.js";
app.use("/profile", profileRoute);
import vendorRoute from "./routes/vendor.js";
app.use("/vendor", vendorRoute);
import productOrderRoute from "./routes/productOrder.js";
app.use("/productOrder", productOrderRoute);

import payment from "./routes/payment.js";
app.use("/checkout", payment);

app.get("/test", (req, res) => {
  res.send("API is working!");
});

app.get("/BestSellers", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM p2.productstatistics ORDER BY AmountSold DESC;");
    res.json(rows.slice(0, 4));
  } catch (error) {
    console.error("Error fetching productstatistics:", error);
    res.status(500).json({ error: "Failed to fetch productstatistics" });
  }
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

/** Gets all product data with related image paths and store name */
app.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "SELECT * FROM p2.product WHERE P2.product.ID = ?;",
      [id]
    );
    res.status(200).json(result);
  }
  catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/faq", async (req, res) => {
  const [result] = await pool.query("SELECT * FROM p2.faq;");
  res.status(200).json(result);
});

app.get("/products", async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT p2.product.*, p2.vendor.Name AS StoreName
      FROM p2.product
      JOIN p2.vendor ON p2.product.StoreID = p2.vendor.ID;
    `);
    res.status(200).json(result);
  }
  catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
