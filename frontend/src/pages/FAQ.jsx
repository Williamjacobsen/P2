import React, { useState, useEffect } from "react";

export default function FAQ() {
  const [faq, setFaq] = useState([]);

  useEffect(() => {
    async function gg() {
      const res = await fetch("http://localhost:3001/FAQ");
      await res.json().then((data) => {
        setFaq(data);
      });
    }
    gg();
  }, []);

  return (
    <div>
      <h1>This is a FAQ</h1>
      {faq.map((data, i) => {
        return (
          <div key={i}>
            <h2>{data.questions}</h2>
            <h4>{data.answers}</h4>
          </div>
        );
      })}
    </div>
  );
}
