import express from "express";
import pool from "../db.js";
import Stripe from "stripe";
import { validationResult } from "express-validator";

import {
  handleValidationErrors,
  validateProfileAccessToken,
} from "../utils/inputValidation.js";
import { getProfile } from "./profile.js";

const router = express.Router();

const stripe = new Stripe(
  "sk_test_51RAr8OPGyAJCpFedxTTr7jZH696z7Bs2GZnqOjEX9xdU0LCOJbWJknMoauzhrgvR0Fku9XgMeNXKaOed0OZiGwf700IkAC8dQF"
);

router.post(
  "/",
  [
    validateProfileAccessToken,
  ],
  async (req, res) => {
    try {
      // Handle validation errors
      handleValidationErrors(req, res, validationResult);
      // Get information from request
      const { products: cartProducts } = req.body; // TODO: NEEDS INPUT VALIDATION!
      const accessToken = req.cookies.profileAccessToken;
      const profile = await getProfile(res, accessToken);

      if (!cartProducts) {
        return res.status(400).json({ error: "No products in the cart." });
      }

      const productIds = cartProducts.map((p) => p.id);
      const [products] = await pool.query(
        "SELECT ID, Name, Price, DiscountProcent FROM Product WHERE ID IN (?)",
        [productIds]
      );

      const productMap = {};
      products.forEach((product) => {
        productMap[product.ID] = product;
      });

      for (const item of cartProducts) {
        if (!productMap[item.id]) {
          return res
            .status(400)
            .json({ error: `Product with ID ${item.id} not found` });
        }
      }

      const line_items = [];
      for (const item of cartProducts) {
        const product = productMap[item.id];
        const discountedPrice =
          product.Price * (1 - product.DiscountProcent / 100);
        const unit_amount = Math.round(discountedPrice * 100); // Convert to cents

        if (unit_amount < 250) {
          return res.status(400).json({
            error: `Product "${product.Name}" (ID: ${product.ID}) price after discount is too low (minimum 2.5 DKK).`,
          });
        }

        line_items.push({
          price_data: {
            currency: "dkk",
            product_data: {
              name: product.Name,
            },
            unit_amount: unit_amount,
          },
          quantity: item.quantity,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url:
          "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:3000/cancel",
      });

      // Add products to profile product orders and remove from stock
      for (const item of cartProducts) {
        for (let i = 0; i < item.quantity; i++) {
          //r Right now, it adds the products before the purchase has been confirmed.
          // Get needed information
          //r Getting this information should happen before making the transaction occurs 
          //r (the transaction should use the same variables as this - else a product might change before
          //r the transation finishes and the user then suddenly gets a different product added to their orders.)
          const [productRows] = await pool.query(`SELECT * FROM p2.Product WHERE ID='${item.id}';`);
          const product = productRows[0];
          const [vendorRows] = await pool.query(`SELECT * FROM p2.Vendor WHERE ID='${product.StoreID}';`);
          const vendor = vendorRows[0];
          const size = -1;
          const sizeID = -1;
          const finalPrice = Math.round(product.Price * (1 - product.DiscountProcent / 100));
          const currentDateTime = new Date();
          currentDateTime.getUTCDate();
          // Add product order to profile
          await pool.query(
            `INSERT INTO p2.ProductOrder
          (CustomerProfileID, IsReady, IsCollected, DateTimeOfPurchase, VendorName, VendorCVR,
          ProductBrand, ProductName, ProductClothingType, ProductSize, ProductGender, ProductPrice)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              profile.ID,
              0,
              0,
              currentDateTime,
              vendor.Name,
              vendor.CVR,
              product.Brand,
              product.Name,
              product.ClothingType,
              size,
              product.Gender,
              finalPrice
            ]);
          // Remove 1 stock of the product
          await pool.query(`UPDATE p2.ProductSize SET Stock=Stock-1 WHERE ID='${sizeID}';`);
        }
      }
      // Send back response
      res.status(200).json({ id: session.id }); // 200 = OK
    } catch (error) {
      if (res._header === null) { // If _header !== null, then the response has already been handled someplace else
        return res.status(500).json({ error: "Internal server error: " + error });
      }
    }
  }
);

router.get("/verify-payment", async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    console.log("No session ID provided in query");
    return res.status(400).json({ error: "Session ID is missing." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    if (
      session.payment_status === "paid" &&
      session.payment_intent.status === "succeeded"
    ) {
      console.log("Payment was successful");
      res.json({ success: true, message: "Payment confirmed" });
    } else {
      console.log("Payment was not successful");
      res
        .status(400)
        .json({ success: false, message: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
