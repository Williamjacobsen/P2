import React, { useState, useEffect } from "react";
import "./FAQ.css";

export default function FAQ() {
  const [faqList, setFaqList] = useState([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await fetch(`http://localhost:3001/faq`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setFaqList(data);
      } else {
        setFaqList([]);
        console.error("Fetched FAQs are not an array:", data);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
      setFaqList([]);
    }
  };

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>

      {faqList.length > 0 ? (
        faqList.map((data) => (
          <div key={data.ID} className="faq-item">
            <h2 className="faq-question">{data.Question}</h2>
            <p className="faq-answer">{data.Answer}</p>
          </div>
        ))
      ) : (
        <p>No FAQs available yet.</p>
      )}
    </div>
  );
}
