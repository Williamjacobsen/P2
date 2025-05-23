import express from "express";
import pool from "../db.js";
import Stripe from "stripe";
import { validationResult } from "express-validator";

import {
  handleValidationErrors,
  validateProfileAccessToken,
  validateCartProducts,
  validateSessionIdParam,
} from "../utils/inputValidation.js";
import { getProfile } from "./profile.js";

const router = express.Router();

const stripe = new Stripe(
  "sk_test_51RAr8OPGyAJCpFedxTTr7jZH696z7Bs2GZnqOjEX9xdU0LCOJbWJknMoauzhrgvR0Fku9XgMeNXKaOed0OZiGwf700IkAC8dQF"
);

router.post(
  "/",
  [validateProfileAccessToken, ...validateCartProducts],
  async (req, res) => {
    try {
      handleValidationErrors(req, res, validationResult);
      const cartProducts = req.body.products;
      const accessToken = req.cookies.profileAccessToken;
      const profile = await getProfile(res, accessToken);

      if (!cartProducts) {
        return res.status(400).json({ error: "No products in the cart." });
      }

      const productIds = cartProducts.map((p) => p.ID);

      const [products] = await pool.query(
        "SELECT ID, Name, Price, DiscountProcent FROM Product WHERE ID IN (?)",
        [productIds]
      );

      if (products.length !== productIds.length) {
        const foundIds = products.map((p) => p.ID);
        const missing = productIds.filter((id) => !foundIds.includes(id));
        return res
          .status(400)
          .json({ error: `Products not found: ${missing.join(", ")}` });
      }

      const productMap = {};
      products.forEach((product) => {
        productMap[product.ID] = product;
      });

      for (const item of cartProducts) {
        const [[sizeRow]] = await pool.query(
          "SELECT Stock FROM ProductSize WHERE ProductID = ? AND Size = ?",
          [item.ID, item.size]
        );
        if (!sizeRow) {
          return res.status(400).json({
            error: `Size "${item.size}" not found for product ID ${item.ID}`,
          });
        }
        if (sizeRow.Stock < item.quantity) {
          return res.status(400).json({
            error: `Not enough stock for "${productMap[item.ID].Name}" size ${
              item.size
            }. Requested ${item.quantity}, but only ${
              sizeRow.Stock
            } available.`,
          });
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

      // Becuase metadata values can have up to 500 characters:

      // cartProducts:
      // [{
      //  ID: 1,
      //  StoreID: 1,
      //  Name: 'Daedric boots',
      //  Price: 1000,
      //  DiscountProcent: 10,
      //  Description: 'Enjoy slavery wearing these.',
      //  ClothingType: 'Footwear',
      //  Brand: 'Nwah',
      //  Gender: 'Male',
      //  StoreName: 'UrbanTrendz',
      //  Path: null,
      //  StoreAddress: 'Nørrebrogade 21, Copenhagen',
      //  size: 'medium',
      //  quantity: 3
      // }, ...],

      // Needed data in metadata
      // CustomerID
      // ID
      // Size
      // Quantity

      // To allow for more products, and faster requests, metadata could be a string of values like '4, 21, 4',
      // but instead we make it a dictionary for readablilty (less optimal)

      const necessaryDataForMetadata = cartProducts.map((item) => ({
        id: item.ID,
        size: item.size,
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url:
          "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:3000/cancel",
        metadata: {
          customerID: profile.ID,
          items: JSON.stringify(necessaryDataForMetadata),
        },
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      console.log("Error during checkout session creation:", error);
      if (res._header === null) {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

router.get("/verify-payment", validateSessionIdParam, async (req, res) => {
  try {
    handleValidationErrors(req, res, validationResult);
    const accessToken = req.cookies.profileAccessToken;
    const profile = await getProfile(res, accessToken);

    const session_id = req.query.session_id;

    if (!session_id) {
      return res.status(400).json({ error: "Session ID is missing." });
    }

    const [existingOrders] = await pool.query(
      "SELECT 1 FROM ProductOrder WHERE StripeSessionID = ? LIMIT 1",
      [session_id]
    );

    if (existingOrders.length > 0) {
      return res.json({ success: true, message: "Payment already confirmed" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    const customerEmail = session.customer_details?.email || null;

    if (
      session.payment_status === "paid" &&
      session.payment_intent.status === "succeeded"
    ) {
      const items = JSON.parse(session.metadata.items);
      const customerID = session.metadata.customerID;

      const products = [];

      for (const item of items) {
        const [productRows] = await pool.query(
          `SELECT Price, DiscountProcent, Name, Brand, ClothingType, Gender, StoreID FROM Product WHERE ID = ?`,
          [item.id]
        );
        const productData = productRows[0];

        const [productStoreRows] = await pool.query(
          `SELECT Name FROM Vendor WHERE ID = ?`,
          [productData.StoreID]
        );
        const storeName = productStoreRows[0]?.Name;

        const currentDateTime = new Date();
        currentDateTime.getUTCDate();

        const [vendorRows] = await pool.query(
          "SELECT CVR, Address FROM Vendor WHERE Name = ?",
          [storeName]
        );
        const vendorCVR = vendorRows[0].CVR;

        const finalPrice =
          item.quantity *
          (productData.Price * (1 - productData.DiscountProcent / 100));

        await pool.query(
          "INSERT INTO ProductOrder (CustomerProfileID, IsReady, IsCollected, DateTimeOfPurchase, VendorName, VendorCVR, ProductBrand, ProductName, ProductClothingType, ProductSize, ProductGender, ProductPrice, Quantity, StripeSessionID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            customerID,
            false,
            false,
            currentDateTime,
            storeName,
            vendorCVR,
            productData.Brand,
            productData.Name,
            productData.ClothingType,
            item.size,
            productData.Gender,
            finalPrice,
            item.quantity,
            session_id,
          ]
        );

        await pool.query(
          "UPDATE ProductSize SET Stock = Stock - ? WHERE ProductID = ? AND Size = ? AND Stock >= ?",
          [item.quantity, item.id, item.size, item.quantity]
        );

        const [rows] = await pool.query(
          `SELECT AmountSold
             FROM p2.productstatistics
            WHERE ProductID = ?`,
          [item.id]
        );

        if (rows.length > 0) {
          await pool.query(
            `UPDATE p2.productstatistics
                SET AmountSold = AmountSold + ?
              WHERE ProductID = ?`,
            [item.quantity, item.id]
          );
        } else {
          await pool.query(
            `INSERT INTO p2.productstatistics (ProductID, AmountSold)
                 VALUES (?, ?)`,
            [item.id, item.quantity]
          );
        }

        products.push({
          ID: item.id,
          name: productData.Name,
          price: productData.Price,
          finalPrice: finalPrice,
          quantity: item.quantity,
          vendorAddress: vendorRows[0].Address,
          customerEmail: customerEmail,
        });
      }

      res.json({
        success: true,
        message: "Payment confirmed",
        products: products,
      });
    } else {
      console.log("Payment not successful - status:", {
        payment_status: session.payment_status,
        payment_intent_status: session.payment_intent?.status,
      });
      res
        .status(400)
        .json({ success: false, message: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    if (res._header === null) {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
