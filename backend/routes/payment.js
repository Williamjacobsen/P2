/* Stripe is in testing mode, here are the cards to test it with:
https://docs.stripe.com/testing#cards */

import express from "express";
import pool from "../db.js";
import Stripe from "stripe";

const router = express.Router();

// todo: use dotenv
const stripe = new Stripe(
  "sk_test_51RAr8OPGyAJCpFedxTTr7jZH696z7Bs2GZnqOjEX9xdU0LCOJbWJknMoauzhrgvR0Fku9XgMeNXKaOed0OZiGwf700IkAC8dQF"
);

router.post("/", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: req.body.items.map((item) => ({
        price_data: {
          currency: "dkk",
          product_data: {
            name: "test",
          },
          unit_amount: 250, // it is in cents (øre) and needs to be atleast 2.5dkk
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:3000/success" /* for testing purposes */,
      cancel_url: "http://localhost:3000/cancel",
    });
    res.json({ id: session.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
