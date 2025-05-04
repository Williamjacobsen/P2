import React from "react";
import "./FAQ.css";
import useGetVendors from "../Profile/useGetVendors";

export default function FAQ() {
  // Hooks
  const [isLoadingVendors, vendors] = useGetVendors();

  // Loading vendors
  if (isLoadingVendors) {
    return <>Loading vendors...</>;
  }

  return (
    <div className="faq-basic">
      <h1>Frequently Asked Questions</h1>

      {/* hardcoded FAQs for hjemmesiden */}
      <div className="faq-item">
        <div className="faq-question">What is the website's contact information?</div>
        <div className="faq-answer">clothing@gmail.com and +45 12 12 12 12</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">Where are the stores located?</div>
        <div className="faq-answer">Aalborg Central (example)</div>
      </div>

      {/* Vendor FAQs*/}
      {vendors.map((vendor, index) => (
        <div key={index} className="faq-item text-with-new-lines">
          <div>{vendor.FAQ.replaceAll("newLineCharacter", "\n")}</div>
        </div>
      ))}
    </div>
  );
}
