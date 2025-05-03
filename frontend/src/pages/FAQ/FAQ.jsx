import React, { useState, useEffect } from "react";

import "./FAQ.css";
import useGetVendors from "../Profile/useGetVendors";

export default function FAQ() {

  // Hooks
  const [isLoadingVendors, vendors] = useGetVendors();

  // Loading vendors
  if (isLoadingVendors) {
    return (<>Loading vendors...</>);
  }

  return (
    <>
      Cool.
    </>
  );
}
