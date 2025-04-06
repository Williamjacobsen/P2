// Tutorial on how to use forms in React: https://www.youtube.com/watch?v=SaEc7jLWvGY

import React from "react";
import Modal from "../Modal/Modal"
import { setCookie, getCookie } from "../../tools/cookies"
import { Navigate } from "react-router-dom";

export default function SignIn() {

  // Already signed in?
  if (isSignedIn()) {
    return <Navigate to="/profile" />;
  }

  return (
    <>
      <h3>--- Sign In ---</h3>
      <form onSubmit={trySignIn}>
        <b>
          Email address:
        </b> <br />
        <input name="email" required /> <br />
        <b>
          Password:
        </b> <br />
        <input type="password" name="password" required /> <br />
        <input type="submit" value="Sign in" />
      </form >
      <br />
      Want to create an account?
      <br />
      <Modal openButtonText="Sign up" modalContent={<SignUpModal />} />
    </>
  );
}

function SignUpModal() {
  return (
    <>
      <form onSubmit={trySignIn}>
        <b>
          Email address:
        </b> <br />
        <input name="email" required /> <br />
        <b>
          Password:
        </b> <br />
        <input type="password" name="password" required /> <br />
        <b>
          Phone number:
        </b> <br />
        <input type="phoneNumber" name="phoneNumber" required /> <br />
        <input type="submit" value="Sign up" />
      </form >
    </>
  )
}

async function trySignUp(event) {
  try {
    // Prevent page from refreshing on submit
    event.preventDefault();

    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const phoneNumber = formData.get("phoneNumber");

    //r NOT FINISHED

    //b Sign in using the new account

    //b reload page

  }
  catch (error) {
    // Alert the user of the error (for example duplicate email)
    alert(error);
  }
}

async function trySignIn(event) {
  try {

    //y TODO: add variable validation

    //y TODO: implement password encryption (right now it is just being sent directly)

    // Prevent page from refreshing on submit
    event.preventDefault();

    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    // Get profile from server
    const profile = await getProfile(email, password);

    // Create sign in cookie
    setCookie("profileEmail", profile.Email, 7);
    setCookie("profilePassword", profile.Password, 7);

    // Reload the page (this navigates to the profile page because the user is now signed in)
    window.location.reload();
  }
  catch (error) {
    // Alert the user of the error (for example wrong password)
    alert(error);
  }
}

/**
 * Tries to get a profile from the server using email and password.
 * @param {*} email 
 * @param {*} password 
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function getProfile(email, password) {
  try {

    //y TODO: implement password encryption (right now it is just being sent directly)

    // Post data from the form to server
    const response = await fetch("http://localhost:3001/try-get-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.errorMessage);
    }
    return data.profile;
  }
  catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Does the user have valied profile credential cookies?
 * @returns true or false.
 */
export function isSignedIn() {
  try {
    const cookieEmail = getCookie("profileEmail");
    const cookiePassword = getCookie("profilePassword");
    if (cookieEmail != null && cookiePassword != null) {
      const profile = getProfile(cookieEmail, cookiePassword);
      if (profile != null) {
        return true;
      }
    }
    return false;
  }
  catch (error) {
    return false;
  }
}