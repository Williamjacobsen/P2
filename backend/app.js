import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import pool from "./db.js";

const app = express();

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
import productImagesRoute from "./routes/product-images.js";
app.use("/product-images", productImagesRoute);
import addProductRoute from "./routes/add-product.js";
app.use("/add-product", addProductRoute);
import deleteProductRoute from "./routes/delete-product.js";
app.use("/delete-product", deleteProductRoute);
import editProductRoute from "./routes/edit-product.js";
app.use("/edit-product", editProductRoute);
import vendorOrders from "./routes/vendor-orders.js";
app.use("/vendor-orders", vendorOrders);
import profileRoute from "./routes/profile.js";
app.use("/profile", profileRoute);
import vendorRoute from "./routes/vendor.js";
app.use("/vendor", vendorRoute);
import productOrderRoute from "./routes/productOrder.js";
app.use("/productOrder", productOrderRoute);
import payment from "./routes/payment.js";
app.use("/checkout", payment);
import productID from "./routes/productID.js";
app.use("/product", productID);
import catalogueRoute from "./routes/catalogue.js";
app.use("/products", catalogueRoute);
import frontPageRoute from "./routes/front-page.js";
app.use("/front-page", frontPageRoute);

export default app;
