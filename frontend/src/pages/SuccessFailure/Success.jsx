import React from "react";
import { useEffect, useState, useRef } from "react";
import { deleteCookie, getAllCookieProducts } from "../../utils/cookies";
import emailjs from "@emailjs/browser";
import useGetProfile from "../Profile/useGetProfile";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Success({ setCartAmount }) {
  /** EMAIL ERROR: 426 Upgrade Required (It means that we have run out of free API usage) */

  const navigate = useNavigate();
  const [hasVerified, setHasVerified] = useState(false);
  const emailSentRef = useRef(false);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("Checking payment...");

  /* Emailjs tomfoolery */
  const EMAILJS_CONFIG = {
    // Emailjs gives 200 free request, and i ain't payin, so these need changing each time we create new gmail for it
    // Contact Rasmus for this because he already made a template for the email
    PUBLIC_KEY: "8C1puUe6dLKfLgpjS",
    SERVICE_ID: "service_fgfnany",
    TEMPLATE_ID: "template_um70l56",
  };

  // Payment
  useEffect(() => {
    async function checkPayment() {
      if (hasVerified || !sessionId) return;

      try {
        const res = await fetch(
          `http://localhost:3001/checkout/verify-payment?session_id=${sessionId}`
        );
        const data = await res.json();

        if (data.success) {
          if (data?.products) {
            SendEmail(data.products);

            for (let product of data.products) {
              deleteCookie(`Product-${product?.ID}`, "/");
            }

            setCartAmount(0);
          }

          console.log("Payment successful");
          setStatus("Payment successful");
          setHasVerified(true);

          navigate("/profile-product-orders");
        } else {
          console.log("Payment not successful");
          setStatus("Payment not successful");
        }
      } catch (error) {
        console.error("Error during payment verification:", error);
        setStatus("Error verifying payment");
      }
    }

    checkPayment();
  }, [sessionId, hasVerified]);

  async function SendEmail(products) {
    if (!products[0]?.customerEmail) {
      return;
    }

    let finalPrice = 0;
    products.map((product) => {
      finalPrice += product.finalPrice;
    });

    const Data = {
      order_id: `${Date.now()}`, // Setting the order id to date for kinda not really random order id
      email: products[0].customerEmail,
      total: finalPrice,
      orders: products.map((product) => ({
        // Mapping out all products
        name: product.name,
        price: product.price,
        units: product.quantity,
        address: product.vendorAddress,
      })),
    };

    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); // Initialization via. authentication

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
  }

  return (
    <div>
      <div>
        <h1>{status}</h1>
      </div>
    </div>
  );
}
