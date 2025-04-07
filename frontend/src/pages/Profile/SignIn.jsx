// Tutorial on how to use forms in React: https://www.youtube.com/watch?v=SaEc7jLWvGY

import React from "react";
import Modal from "../Modal/Modal"
import { setCookie, getCookie } from "../../utils/cookies"
import { Navigate } from "react-router-dom";

export default function SignIn() {

  // Already signed in?
  if (isSignedIn() == true) {
    return <Navigate to="/profile" />;
  }

  return (
    <>
      <h3>--- Sign In ---</h3>
      <form onSubmit={signIn}>
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

/**
 * Does the user have valied profile credential cookies?
 * @returns true or false.
 */
export function isSignedIn() {
  try {
    // Get login credential from cookies
    const cookieEmail = getCookie("profileEmail");
    const cookiePassword = getCookie("profilePassword");

    // Are the login credentials valid?
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

function SignUpModal() {
  return (
    <>
      <form onSubmit={signUp}>
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
        <input type="phoneNumber" name="phoneNumber" required minLength={8} maxLength={16} /> <br />
        <input type="submit" value="Sign up" />
      </form >
    </>
  )
}


async function signIn(event) {
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
    setCookie("profilePhoneNumber", profile.PhoneNumber, 7);

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
    const profile = await addProfile(email, password, phoneNumber);

    // Create sign in cookie
    setCookie("profileEmail", profile.Email, 7);
    setCookie("profilePassword", profile.Password, 7);
    setCookie("profilePhoneNumber", profile.PhoneNumber, 7);

    // Reload the page (this navigates to the profile page because the user is now signed in)
    window.location.reload();
  }
  catch (error) {
    // Alert the user of the error (for example duplicate email)
    alert(error);
  }
}

/**
* Tries to get a profile from the server using email and password.
* @param {*} email string
* @param {*} password string
* @returns either a JSON object with the profile, or a Promise.reject() with an error message.
*/
async function getProfile(email, password) {
  try {

    //y TODO: implement password encryption (right now it is just being sent directly)

    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/get", {
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
 * Tries to get a profile from the server using email and password.
 * @param {*} email string
 * @param {*} password string
 * @param {*} phoneNumber int
 * @returns either a JSON object with the profile, or a Promise.reject() with an error message.
 */
async function addProfile(email, password, phoneNumber) {
  try {

    //y TODO: implement password encryption (right now it is just being sent directly)

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
      throw new Error(data.errorMessage);
    }
    return data.profile;
  }
  catch (error) {
    return Promise.reject(error);
  }
}


