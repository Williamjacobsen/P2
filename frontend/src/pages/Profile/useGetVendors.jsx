import { useState, useEffect } from "react";

/**
 * React hook (which is why the function name starts with "use").
 * Gets an array of vendor JSON objects from the server's database.
 * @returns the object [isLoading (a boolean), vendors (an array of JSON object)].
 */
export default function useGetVendors() {

  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setVendors(await requestVendors());
        setIsLoading(false);
      }
      catch (error) {
        alert(error);
      }
    })();
  }, []);

  return [isLoading, vendors];
}

/**
 * Tries to get all vendors from the server.
 * @returns either a list of vendor objects (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestVendors() {
  try {
    const response = await fetch(`http://localhost:3001/vendor/get-all`, {
      method: "GET",
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) return Promise.reject(data.errorMessage);
    return data.vendors;
  }
  catch (error) {
    return Promise.reject(error);
  }
}