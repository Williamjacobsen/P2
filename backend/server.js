import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import pool from "./db.js";

const app = express();
const port = 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // allows cookies and credentials to be sent to the backend
  })
);
app.use(express.json()); // This allows the app to use json.
app.use("/uploads", express.static("uploads"));
app.use(cookieParser()); // This allows reading cookies from incoming requests.

// Routes
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
import faqRoute from "./routes/faq.js";
app.use("/faq", faqRoute);


// Stuff that needs to be made into separate files in the "route" directory
app.get("/test", (req, res) => {
  res.send("API is working!");
});

app.get("/BestSellers", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM p2.productstatistics ORDER BY AmountSold DESC;"
    );
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
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/shopCircles", async (req, res) => {
  try{
    const [result] = await pool.query(`
        SELECT * FROM Vendor
        LIMIT 25
    `);
    res.status(200).json(result)
  }catch (err){
    console.log("Error in database query for shopcircles", err);
    res.status(500).json({error: "Failed to fetch ShopCircles"})
  }
})

app.get("/VendorProducts/:vendorid", async (req, res) => {
  const { vendorid } = req.params;  // VendorID is grabbed from the url parameter

  if (!vendorid) {
    return res.status(400).json({ message: "Vendor ID is required" });
  }

  try {
    const [result] = await pool.query(`
      SELECT p2.Product.*, p2.Vendor.Name AS StoreName
      FROM p2.Product
             JOIN p2.Vendor ON p2.Product.StoreID = p2.Vendor.ID
      WHERE p2.Product.StoreID = ?
    `, [vendorid]);  // Use parameterized query to safely inject vendorid
    res.status(200).json(result);
  } catch (err) {
    console.log("error in database query for vendorproducts", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
