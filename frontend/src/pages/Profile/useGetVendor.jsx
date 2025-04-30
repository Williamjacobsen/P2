// Tutorial on custom hooks (because this file revolves around a custom hook) in React: https://www.youtube.com/watch?v=I2Bgi0Qcdvc

import { useState, useEffect } from "react";

/**
 * React hook (which is why the function name starts with "use").
 * Gets a vendor JSON object from the server's database.
 * @returns the object [isLoading (a boolean), vendor (a JSON object)].
 */
export default function useGetVendor(vendorID) {

  const [isLoading, setIsLoading] = useState(true);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (vendorID === undefined || vendorID === null) {
          setVendor(null);
          setIsLoading(false);
          return [isLoading, vendor];
        }
        setVendor(await requestVendor(vendorID));
        setIsLoading();
      }
      catch (error) {
        alert(error);
      }
    })();
  }, [vendorID]);

  return [isLoading, vendor];
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a vendor from the server.
 * @returns either null, a vendor object (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestVendor(vendorID) {
  try {
    const response = await fetch(`http://localhost:3001/vendor/get?vendorID=${vendorID}`, {
      method: "GET",
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