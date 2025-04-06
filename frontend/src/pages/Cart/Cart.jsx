import React from "react";
import { loadStripe } from "@stripe/stripe-js";

// todo: use dotenv
const stripePromise = loadStripe(
  "pk_test_51RAr8OPGyAJCpFedzCYA3yqpXZ6sZW18ZtxxlLviFJymktEIgBp7yjJbkuZHBmJzh8LAzF5TiR8taTL5DTcGy9Vm0019UACqMu"
);

export default function Cart() {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch("http://localhost:3001/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: [{ id: 1, quantity: 1 }] }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  return (
    <>
      <button onClick={handleCheckout}>Checkout</button>
    </>
  );
}
