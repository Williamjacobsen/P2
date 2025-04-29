import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SuccessPage() {
  const { sessionId } = useParams();
  const [status, setStatus] = useState("Checking payment...");

  useEffect(() => {
    async function checkPayment() {
      const res = await fetch(
        `/checkout/verify-payment?session_id=${sessionId}`
      );
      const data = await res.json();

      if (data.success) {
        setStatus("Payment successful");
      } else {
        setStatus("Payment not successful");
      }
    }

    if (sessionId) {
      checkPayment();
    }
  }, [sessionId]);

  return (
    <div>
      <h1>{status}</h1>
    </div>
  );
}
