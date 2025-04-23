// Tutorial on custom hooks (because this file revolves around a custom hook) in React: https://www.youtube.com/watch?v=I2Bgi0Qcdvc

import { useState, useEffect } from "react";

import { requestAccessToken } from "./SignIn";
import { getCookie } from "../../utils/cookies";

/**
 * Custom hook (which is why the function name starts with "use"). 
 * Gets a profile JSON object from the server's database.
 * @returns the object [isLoading (a boolean), profile (a JSON object)].
 */
export default function useGetProfile(accessToken) {

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (accessToken === null) {
          setProfile(null);
          setIsLoading(false);
          return [isLoading, profile];
        }
        setProfile(await requestProfile(accessToken));
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
 * @returns either a profile object (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestProfile(accessToken) {
  try {
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is expired.") {
        const newAccessToken = await requestAccessToken(getCookie("profileRefreshToken"));
        return await requestProfile(newAccessToken);
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