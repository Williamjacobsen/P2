// Tutorial on custom hooks (because this file revolves around a custom hook) in React: https://www.youtube.com/watch?v=I2Bgi0Qcdvc

import { useState, useEffect } from "react";
import { RequestProfile } from "./SignIn"
import { getCookie } from "../../utils/cookies"

/**
 * Custom hook (which is why the function name starts with "use"). 
 * Checks that the user's cookie profile credentials 
 * match with a profile on the server's database.
 * The booleans state "isLoading" is true until the check has been finished.
 * The boolean state "isLoginValid" is the result of the check.
 * @returns the object [isLoading (a boolean), isLoginValid (a boolean)].
 */
export default function useCheckLoginValidity() {

  const [isLoading, setIsLoading] = useState(true);
  const [isLoginValid, setIsLoginValid] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (await isCookieLoginValid()) {
          setIsLoginValid(true);
        }
        setIsLoading(false);
      }
      catch (error) {
        alert(error);
      }
    })();
  }, []);

  return [isLoading, isLoginValid];
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Checks that the user's cookie profile credentials match a profile in the server's database.
 * @returns true or false.
 */
async function isCookieLoginValid() {
  try {
    //y TODO: delete cookies and go to sign in if your saved cookie credentials are now invalid because the credentials have been changed on another device
    // Get login credential from cookies
    const cookieAccessToken = getCookie("profileAccessToken");
    // Are the login credentials valid?
    if (cookieAccessToken !== null && cookiePassword !== null) {
      const profile = await RequestProfile(cookieAccessToken);
      if (profile !== null) {
        return true;
      }
    }
    return false;
  }
  catch (error) {
    return false;
  }
}