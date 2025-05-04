import React, { useState, useEffect } from "react";

import "./FAQ.css";
import useGetVendor from "../Profile/useGetVendor";

export default function FAQ() {
  // Hooks
  const [isLoadingVendors, vendors] = useGetVendor();

  // Loading vendors
  if (isLoadingVendors) {
    return <>Loading vendors...</>;
  }

  return (
    <>
      <hr />
      <div class="text-with-new-lines">
        {vendors[0].FAQ.replaceAll("newLineCharacter", "\n")}
      </div>
      <br />
      <hr />
      <div class="text-with-new-lines">
        {vendors[1].FAQ.replaceAll("newLineCharacter", "\n")}
      </div>
    </>
  );
}
