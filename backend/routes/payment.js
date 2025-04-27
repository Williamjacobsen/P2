import express from "express";
import pool from "../db.js";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(
  "sk_test_51RAr8OPGyAJCpFedxTTr7jZH696z7Bs2GZnqOjEX9xdU0LCOJbWJknMoauzhrgvR0Fku9XgMeNXKaOed0OZiGwf700IkAC8dQF"
);

router.post("/", async (req, res) => {
  try {
    const { products: cartProducts } = req.body;

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
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
