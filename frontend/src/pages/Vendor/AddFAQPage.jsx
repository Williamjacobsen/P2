import React from "react";
import AddFAQForm from "./AddFAQForm";

export default function AddFAQPage() {
  return (
    <div className="add-faq-page">
      <h1>Add a New FAQ</h1>
      <AddFAQForm vendorId={1} /> {/* Pass the vendorId here */}
    </div>
  );
}
