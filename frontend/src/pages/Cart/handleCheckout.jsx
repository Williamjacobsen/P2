import { loadStripe } from "@stripe/stripe-js";

// todo: use dotenv
const stripePromise = loadStripe(
  "pk_test_51RAr8OPGyAJCpFedzCYA3yqpXZ6sZW18ZtxxlLviFJymktEIgBp7yjJbkuZHBmJzh8LAzF5TiR8taTL5DTcGy9Vm0019UACqMu"
);

export default async function handleCheckout(products) {
  try {
    const stripe = await stripePromise;

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/checkout`,
      {
        method: "POST",
        credentials: "include", // Ensures cookies are sent with the request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products }),
      }
    );

    const session = await response.json();

    if (!response.ok) {
      return Promise.reject(session.error);
    }

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      return Promise.reject(result.error.message);
    }
  } catch (error) {
    alert(error);
  }
}
