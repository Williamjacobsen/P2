// Tutorial on custom hooks (because this file revolves around a custom hook) in React: https://www.youtube.com/watch?v=I2Bgi0Qcdvc

import { useState, useEffect } from "react";

import { requestAccessToken } from "./ReSignInPopUp";

/**
 * Custom hook (which is why the function name starts with "use"). 
 * Gets a profile JSON object from the server's database.
 * @returns the object [isLoading (a boolean), profile (a JSON object)].
 */
export default function useGetProfile() {

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setProfile(await requestProfile());
        setIsLoading(false);
      }
      catch (error) {
        alert(error);
      }
    })();
  }, []);

  return [isLoading, profile];
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a profile from the server.
 * @returns either undefined, or a profile object (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestProfile() {
  try {
    const response = await fetch("http://localhost:3001/profile/get", {
      method: "GET",
      credentials: "include", // Ensures cookies are sent with the request
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token cookie is undefined.") {
        return undefined;
      }
      else if (data.error === "Access token is expired.") {
        await requestAccessToken();
        return await requestProfile();
      }
      else {
        return Promise.reject(data.error);
      }
    }
    return data.profile;
  }
  catch (error) {
    return Promise.reject(error);
  }
}