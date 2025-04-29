import React from "react";
import { useEffect, useState, useRef } from "react";
import { deleteCookie, getAllCookieProducts } from "../../utils/cookies";
import emailjs from "@emailjs/browser";
import useGetProfile from "../Profile/useGetProfile";
import { useSearchParams } from "react-router-dom";

export default function Success() {
  const [isReadyToSendEmail, setIsReadyToSendEmail] = useState(false);
  const [isLoading, profile] = useGetProfile();
  const emailSentRef = useRef(false);

  /* Everything from here till emailjs part is just copy paste from Cart.jsx */
  const [cartProducts, setCartProducts] = useState([]);
  const [cookieProducts, setCookieProducts] = useState([]);

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("Checking payment...");

  useEffect(() => {
    async function checkPayment() {
      try {
        const res = await fetch(
          `http://localhost:3001/checkout/verify-payment?session_id=${sessionId}`
        );

        const data = await res.json();

        if (data.success) {
          console.log("Payment successful");
          setStatus("Payment successful");
        } else {
          console.log("Payment not successful");
          setStatus("Payment not successful");
        }
      } catch (error) {
        console.error("Error during payment verification:", error);
        setStatus("Error verifying payment");
      }
    }

    if (sessionId) {
      checkPayment();
    } else {
      console.log("No session ID found in URL params.");
    }
  }, [sessionId]);

  useEffect(() => {
    setCookieProducts(getAllCookieProducts());
  }, []);

  useEffect(() => {
    async function fetchAllProductData() {
      try {
        const products = await Promise.all(
          cookieProducts.map((product) =>
            fetch(`http://localhost:3001/product/${product.id}`)
              .then((res) => res.json())
              .then((data) => {
                const dbProduct = data[0];
                //ok so, we grab product info from the database with fetch which gives us an array with a single object in it
                //the reason for that is SQL returns rows even if there is just one match for the query
                //then we extract the single object from the array the db gives back with data[0],
                //then we take the database object and use spread operator to create a new object with all the same info,
                //but with the size and quantity from the cookie added onto it aswell
                return {
                  ...dbProduct,
                  size: product.size,
                  quantity: product.quantity,
                };
              })
          )
        );
        setCartProducts(products);
        setIsReadyToSendEmail(true); // The only part i added
      } catch (err) {
        console.log("failed to fetch products for cart", err);
      }
    }
    fetchAllProductData();
  }, [cookieProducts]);

  function calculateTotalPrice(products) {
    if (products.length === 0) {
      return 0;
    }

    let sum = 0;
    for (const product of products) {
      sum += product.Price * product.quantity;
    }
    return sum;
  }

  /* Emailjs tomfoolery */
  const EMAILJS_CONFIG = {
    // Emailjs gives 200 free request, and i ain't payin, so these need changing each time we create new gmail for it
    // Contact Rasmus for this because he already made a template for the email
    PUBLIC_KEY: "8C1puUe6dLKfLgpjS",
    SERVICE_ID: "service_fgfnany",
    TEMPLATE_ID: "template_um70l56",
  };

  useEffect(() => {
    if (
      isReadyToSendEmail &&
      !isLoading &&
      profile &&
      cartProducts.length > 0 &&
      !emailSentRef.current
    ) {
      // All data for the mail
      const Data = {
        order_id: `${Date.now()}`, // Setting the order id to date for kinda not really random order id
        email: profile.Email,
        total: calculateTotalPrice(cartProducts),
        orders: cartProducts.map((product) => ({
          // Mapping out all products
          name: product.Name,
          price: product.Price,
          units: product.quantity,
          address: product.StoreAddress,
        })),
      };

      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); // Initialization via. authentication

      const sendEmail = async () => {
        try {
          const response = await emailjs.send(
            // Try to send email with params;
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            {
              order_id: Data.order_id,
              email: Data.email,
              orders: Data.orders,
              total: Data.total,
              to_email: Data.email,
            }
          );
          console.log("Email sent successfully!", response);
          emailSentRef.current = true;
        } catch (error) {
          console.error("Email failed:", error);
        }
      };
      sendEmail();
    }
  }, [isReadyToSendEmail, isLoading, profile, cartProducts]);

  return (
    <div>
      <div>
        <h1>{status}</h1>
      </div>
      <h1>Thank you for your order</h1>
      <p>Total price of purchase {calculateTotalPrice(cartProducts)} DKK</p>
      {cartProducts.map((product) => (
        <div key={product.id}>
          <br></br>
          <p>You have ordered from: {product.StoreName}</p>
          <p>Price of item: {product.Price} DKK</p>
          <p>
            Ordered item: {product.Name} from {product.Brand}, in amount of{" "}
            {product.quantity} and size {product.size}
          </p>
          <p>Pickup from store at {product.StoreAddress}</p>
        </div>
      ))}
    </div>
  );
}
