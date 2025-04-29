import express from "express";
import pool from "../db.js";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(
  "sk_test_51RAr8OPGyAJCpFedxTTr7jZH696z7Bs2GZnqOjEX9xdU0LCOJbWJknMoauzhrgvR0Fku9XgMeNXKaOed0OZiGwf700IkAC8dQF"
);

router.post("/", async (req, res) => {
  try {
    console.log("POST /checkout-session triggered");
    const { products: cartProducts } = req.body;
    console.log("Received cart products:", cartProducts);

    if (!cartProducts) {
      console.log("No products found in request body");
      return res.status(400).json({ error: "No products in the cart." });
    }

    const productIds = cartProducts.map((p) => p.id);
    console.log("Fetching products from DB with IDs:", productIds);

    const [products] = await pool.query(
      "SELECT ID, Name, Price, DiscountProcent FROM Product WHERE ID IN (?)",
      [productIds]
    );

    console.log("Products fetched from DB:", products);

    const productMap = {};
    products.forEach((product) => {
      productMap[product.ID] = product;
    });

    for (const item of cartProducts) {
      if (!productMap[item.id]) {
        console.log(`Product with ID ${item.id} not found in DB`);
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

      console.log(
        `Product ${product.Name} (ID: ${product.ID}) - original price: ${product.Price}, discount: ${product.DiscountProcent}%, final unit amount: ${unit_amount}`
      );

      if (unit_amount < 250) {
        console.log(
          `Product "${product.Name}" price after discount is below minimum`
        );
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

    console.log("Creating Stripe session with line items:", line_items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    console.log("Stripe session created:", session.id);

    res.json({ id: session.id });
  } catch (error) {
    console.log("Error during checkout session creation:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/verify-payment", async (req, res) => {
  const { session_id } = req.query;
  console.log("GET /verify-payment triggered with session_id:", session_id);

  if (!session_id) {
    console.log("No session ID provided in query");
    return res.status(400).json({ error: "Session ID is missing." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    console.log("Retrieved Stripe session:", session.id);
    console.log("Payment status:", session.payment_status);
    console.log("Payment intent status:", session.payment_intent.status);

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
