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
    validateProfileAccessToken, //r
  ],
  async (req, res) => {
    try {
      handleValidationErrors(req, res, validationResult); //r

      const { products: cartProducts } = req.body;

      const accessToken = req.cookies.profileAccessToken; //R

      const profile = await getProfile(res, accessToken); //R

      if (!cartProducts) {
        return res.status(400).json({ error: "No products in the cart." });
      }

      const productIds = cartProducts.map((p) => p.ID);

      const [products] = await pool.query(
        "SELECT ID, Name, Price, DiscountProcent FROM Product WHERE ID IN (?)",
        [productIds]
      );

      const productMap = {};
      products.forEach((product) => {
        productMap[product.ID] = product;
      });

      for (const item of cartProducts) {
        if (!productMap[item.ID]) {
          return res
            .status(400)
            .json({ error: `Product with ID ${item.ID} not found` });
        }
      }

      const line_items = [];
      for (const item of cartProducts) {
        const product = productMap[item.ID];
        const discountedPrice =
          product.Price * (1 - product.DiscountProcent / 100);
        const unit_amount = Math.round(discountedPrice * 100);

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
        metadata: {
          customerID: profile.ID,
          cart: JSON.stringify(cartProducts),
        },
      });

      res.json({ id: session.id });
    } catch (error) {
      console.log("Error during checkout session creation:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/verify-payment", async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
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
      const cart = JSON.parse(session.metadata.cart);
      const customerID = session.metadata.customerID;

      for (const product of cart) {
        const [sizeIDRows] = await pool.query(
          "select ID from `p2`.ProductSize WHERE ProductID = ?",
          [product.ID]
        );
        const sizeID = sizeIDRows[0]?.ID;

        const date_time = new Date();
        const date =
          date_time.getFullYear() +
          "-" +
          ("0" + (date_time.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + date_time.getDate()).slice(-2) +
          " " +
          ("0" + date_time.getHours()).slice(-2) +
          "-" +
          ("0" + date_time.getMinutes()).slice(-2) +
          "-" +
          ("0" + date_time.getSeconds()).slice(-2);

        await pool.query(
          "INSERT INTO ProductOrder (CustomerID, ProductID, ProductSizeID, IsReady, IsCollected, DateTimeOfPurchase) VALUES (?, ?, ?, ?, ?, ?)",
          [customerID, product.ID, sizeID, true, false, date]
        );

        await pool.query(
          "UPDATE ProductSize SET Stock = Stock - ? WHERE ProductID = ? AND Size = ? AND Stock >= ?",
          [product.quantity, product.ID, product.size, product.quantity]
        );
      }

      res.json({ success: true, message: "Payment confirmed" });
    } else {
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
