import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function SuccessPage() {
  //
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("Checking payment...");

  console.log("sessionId:", session_id);

  useEffect(() => {
    async function checkPayment() {
      console.log("Checking payment for sessionId:", sessionId);
      try {
        const res = await fetch(
          `/checkout/verify-payment?session_id=${sessionId}`
        );
        const data = await res.json();
        console.log("Payment verification response:", data);

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
      console.log("Session ID exists, initiating payment check...");
      checkPayment();
    } else {
      console.log("No session ID found in URL params.");
    }
  }, [sessionId]);

  return (
    <div>
      <h1>{status}</h1>
    </div>
  );
}
