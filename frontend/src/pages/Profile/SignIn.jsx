// Tutorial on how to use forms in React: https://www.youtube.com/watch?v=SaEc7jLWvGY

import React from "react";
import { Navigate } from "react-router-dom";

import Modal from "../Modal/Modal"
import {
  setCookie,
  deleteCookie,
  getCookie,
  cookieName_ProfileAccessToken,
  cookieName_ProfileRefreshToken
} from "../../utils/cookies"
import useGetProfile from "./useGetProfile";

export default function SignIn() {

  // Hooks
  const [isLoadingProfile, profile] = useGetProfile(getCookie(cookieName_ProfileAccessToken));

  // Is the user already signed in?
  if (isLoadingProfile) {
    return (<>Loading login...</>);
  }
  else if (profile !== null) {
    return (<Navigate to="/profile" replace />);
  }

  return (
    <>
      <h3>--- Sign In ---</h3>
      <form onSubmit={signIn}>
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
      <br />
      Want to create an account?
      <br />
      <Modal openButtonText="Sign up" modalContent={<SignUpModal />} />
    </>
  );
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Modals
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

function SignUpModal() {
  return (
    <>
      <form onSubmit={signUp}>
        <b>
          Email address:
        </b> <br />
        <input type="email" name="email" required maxLength={150} /> <br />
        <b>
          Password:
        </b> <br />
        <input type="password" name="password" required maxLength={500} /> <br />
        <b>
          Phone number:
        </b> <br />
        <input type="text" name="phoneNumber" required minLength={8} maxLength={16} /> <br />
        <input type="submit" value="Sign up" />
      </form >
    </>
  )
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Events
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

async function signIn(event) {
  try {
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    // Get profile from server
    const tokens = await requestSignIn(email, password);
    // Create sign in cookie
    setLoginCookies(tokens.refreshToken, tokens.accessToken);
    // Reload the page (this navigates to the profile page because the user is now signed in)
    window.location.reload();
  }
  catch (error) {
    // Alert the user of the error (for example wrong password)
    alert(error);
  }
}

async function signUp(event) {
  try {
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const phoneNumber = formData.get("phoneNumber");
    // Add profile to server
    const tokens = await requestProfileCreation(email, password, phoneNumber);
    // Create sign in cookies
    setLoginCookies(tokens.refreshToken, tokens.accessToken);
    // Reload the page (this navigates to the profile page because the user is now signed in)
    window.location.reload();
  }
  catch (error) {
    // Alert the user of the error (for example duplicate email)
    alert(error);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Requests
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Tries to get a profile from the server using email and password.
 * @param {*} email string
 * @param {*} password string
 * @param {*} phoneNumber int
 * @returns either an object { refreshToken, accessToken }, or a Promise.reject() with an error message.
 */
async function requestProfileCreation(email, password, phoneNumber) {
  try {
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        phoneNumber
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      return Promise.reject(data.error);
    }
    const tokens = await requestSignIn(email, password);
    return tokens;
  }
  catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Tries to get a profile from the server using email and password.
 * @returns either an object { refreshToken, accessToken }, or a Promise.reject() with an error message.
 */
async function requestSignIn(email, password) {
  try {
    const oldRefreshToken = getCookie(cookieName_ProfileRefreshToken);
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        oldRefreshToken,
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      return Promise.reject(data.error);
    }
    const tokens = data; // This is just to make it easier to understand what the data contains.
    return tokens;
  }
  catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Tries to get a new profile access token from the server.
 * @returns either a JWT access token, or a Promise.reject() with an error message.
 */
export async function requestAccessToken(refreshToken) {
  try {
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/generate-access-token", {
      method: "POST",
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
        // const newRefreshToken = await popup();
        // return await requestAccessToken(newRefreshToken);
        //r ask for login via pop up that stops execution of other stuff (the user can also opt to log out)
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

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Cookies
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

export function setLoginCookies(refreshToken, accessToken) {
  setCookie(cookieName_ProfileRefreshToken, refreshToken, 7);
  setCookie(cookieName_ProfileAccessToken, accessToken, 7);
}

export function deleteLoginCookies() {
  deleteCookie(cookieName_ProfileRefreshToken);
  deleteCookie(cookieName_ProfileAccessToken);
}




