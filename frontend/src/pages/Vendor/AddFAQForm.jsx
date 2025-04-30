import React, { useState } from "react";

export default function AddFAQForm({ vendorId, onFaqAdded }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id: vendorId,
          question,
          answer,
        }),
      });

      if (res.ok) {
        setQuestion("");
        setAnswer("");
        if (onFaqAdded) onFaqAdded(); // Notify parent if needed
        alert("FAQ added successfully!");
      } else {
        console.error("Failed to add FAQ, server responded with:", res.status);
        alert("Failed to add FAQ. Please try again.");
      }
    } catch (error) {
      console.error("Failed to add FAQ:", error);
      alert("Failed to add FAQ. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Enter the answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
      />
      <button type="submit" disabled={!question || !answer}>
        Add FAQ
      </button>
    </form>
  );
}
