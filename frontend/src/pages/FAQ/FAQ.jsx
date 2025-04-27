import React, { useState, useEffect } from "react";
import "./FAQ.css";

export default function FAQ() {
    const faq = [
      { question: "How long is the return policy?", answer: "14 days." },

      { question: "What happens if I don't return the item within the 14 days?", answer: "You will have to pay for item." },

      { question: "Can I exchange the item for free if I got the wrong size?", answer: "Yes you are able to change the sizing." },

      { question: "How do I pay for my order?", answer: "You can either pay online or in person." },

      { question: "Are you able to get your item shipped?", answer: "No, you are not able to get the item shipped to you." },

    ];
  

  return (
    <div className= "faq-container">
      <h1>Frequently Asked Questions</h1>
      {faq.map((data, i) => {
        return (
          <div key={i} classnAME="faq-item">
            <h2 className="faq-question">{data.questions}</h2>
            <p className="faq-answer">{data.answers}</p>
          </div>
        );
      })}
    </div>
  );
}
