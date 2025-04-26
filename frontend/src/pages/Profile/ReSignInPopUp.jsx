

import { useState } from "react";
import "./ReSignInPopUp.css";
import { requestSignIn } from "./SignIn";
import { signOut } from "./Profile";
import { getCookie, cookieName_ProfileRefreshToken } from "../../utils/cookies"

/** This is a function that sets the pop up visibility using useState() hooks inside the React component. */
let setPopUpVisibility;

export default function ReSignInPopUp() {

  // Pop up visibility
  const [isVisible, setIsVisible] = useState(false);
  setPopUpVisibility = function (isItVisible) {
    setIsVisible(isItVisible);
  }

  return (
    <>
      {
        isVisible && (
          <div className="window">
            <div className="overlay"></div>
            <div className="window-content">
              Your sign in refresh token has expired. Please sign in again, or sign out.
              <br />
              If you sign in, the page will not reload, so do not worry about losing progress.
              <form onSubmit={ReSignIn}>
                <b>
                  Email address:
                </b> <br />
                <input type="email" name="email" required maxLength={150} /> <br />
                <b>
                  Password:
                </b> <br />
                <input type="password" name="password" required maxLength={500} /> <br />
                <input type="submit" value="Sign in" />
              </form >
              <button className="button" onClick={signOut}> {/* signOut() also refreshes the page */}
                Sign out
              </button>
            </div>
            <br />
          </div>
        )
      }
    </>
  );
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Sign in promise
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/** This is a promise that gets resolved once the user succesfully signs in again after their refresh token expires. */
let reSignInPromise;
/** This is a resolver function that, when called, resolves the promise "reSignInPromise". */
let resolveReSignInPromise;

/**
 * Makes "signReInPromise" into a new promise and assigns "resolveReSignInPromise" as its resolve function.
 * So, when "resolveReSignInPromise" is called, the "reSignInPromise" becomes resolved.
 */
function createReSignInPromise() {
  reSignInPromise = new Promise(function (resolve) {
    resolveReSignInPromise = resolve; // So, when you call the "resolveReSignInPromise" function, the "reSignInPromise" promise will resolve.
  });
}

/**
 * Shows a pop up with a re-confirmation sign in form.
 * This awaits until the user either succesfully signs in via the form 
 * (which creates new cookies with access and refresh tokens), 
 * or they log out (which refreshes the page).
 * @returns Either nothing, or a Promise.reject with an error message.
 */
async function promptReSignIn() {
  try {
    setPopUpVisibility(true);
    createReSignInPromise();
    await reSignInPromise; // This awaits until another function calls the "resolveReSignInPromise" resolver function.
    return;
  }
  catch (error) {
    return Promise.reject(error);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

async function ReSignIn(event) {
  try {
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    // Get authetification tokens from server
    await requestSignIn(email, password);
    // Hide pop up
    setPopUpVisibility(false);
    // Resolve promise
    resolveReSignInPromise();
  }
  catch (error) {
    // Alert the user of the error (for example wrong password)
    alert(error);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Requests
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a new profile access token from the server.
 * @returns either a JWT access token, or a Promise.reject() with an error message.
 */
export async function requestAccessToken(refreshToken) {
  try {
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/generate-access-token", {
      method: "POST",
      credentials: "include", //r Ensures cookies are sent with the request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Refresh token is expired") {
        await promptReSignIn(); // When the user signs in, a new refresh token will be available in the cookies.
        return await requestAccessToken(getCookie(cookieName_ProfileRefreshToken));
      }
      else {
        return Promise.reject(data.errorMessage);
      }
    }
    return data.accessToken;
  }
  catch (error) {
    return Promise.reject(error);
  }
}