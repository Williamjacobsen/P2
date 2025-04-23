// Tutorial on custom hooks (because this file revolves around a custom hook) in React: https://www.youtube.com/watch?v=I2Bgi0Qcdvc

import { useState, useEffect } from "react";

/**
 * React hook (which is why the function name starts with "use").
 * Gets a vendor JSON object from the server's database.
 * @returns the object [isLoading (a boolean), vendor (a JSON object)].
 */
export default function useGetVendor(profile) {

  const [isLoading, setIsLoading] = useState(true);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (profile === null || profile.VendorID === null) {
          setVendor(null);
          setIsLoading(false);
          return [isLoading, vendor];
        }
        setVendor(await requestVendor(profile.VendorID));
        setIsLoading();
      }
      catch (error) {
        alert(error);
      }
    })();
  }, [profile]);

  return [isLoading, vendor];
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * @returns either a JSON object with the vendor (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestVendor(vendorID) {
  try {
    //y TODO: implement password encryption (right now it is just being sent directly)
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/vendor/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendorID
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) return Promise.reject(data.errorMessage);
    return data.vendor;
  }
  catch (error) {
    return Promise.reject(error);
  }
}