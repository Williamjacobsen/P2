import React, { useState, useEffect } from "react";

export default function FAQ() {
  const arr = ["gg", "hh", "aa"];

  const [faq, setFaq] = useState([]);

  useEffect(async () => {
    const res = await fetch("http://localhost:3001/FAQ");
    await res.json().then((data) => {
      console.log(data);
      setFaq(data);
    });
  }, []);

  return (
    <div>
      <h1>This is a FAQ</h1>
      {faq.map((data) => {
        return (
          <div>
            <h2>{data.questions}</h2>
            <h4>{data.answers}</h4>
          </div>
        );
      })}
    </div>
  );
}
