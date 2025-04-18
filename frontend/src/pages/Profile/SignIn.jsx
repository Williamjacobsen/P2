// Tutorial on how to use forms in React: https://www.youtube.com/watch?v=SaEc7jLWvGY

import React from "react";
import Modal from "../Modal/Modal"
import { setCookie, deleteCookie } from "../../utils/cookies"
import { useNavigate } from "react-router-dom";
import useCheckLoginValidity from "./useCheckLoginValidity";

export default function SignIn() {

  // Hooks
  const navigate = useNavigate();
  const [isLoadingLogin, isLoginValid] = useCheckLoginValidity();

  // Is the user already signed in?
  if (isLoadingLogin) {
    return (<>Loading login...</>);
  }
  else if (isLoginValid) {
    navigate("/profile");
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
    //y TODO: implement password encryption (right now it is just being sent directly)
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    // Get profile from server
    const profile = await RequestProfile(email, password);
    // Create sign in cookie
    createProfileCookies(profile, password);
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
    //y TODO: implement password encryption (right now it is just being sent directly)
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const phoneNumber = formData.get("phoneNumber");
    // Add profile to server
    const profile = await requestProfileCreation(email, password, phoneNumber);
    // Create sign in cookie
    createProfileCookies(profile, password);
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
 * @returns either a profile object (from the MySQL database), or a Promise.reject() with an error message.
 */
export async function RequestProfile(email, password) {
  try {
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
    if (!response.ok) return Promise.reject(data.errorMessage);
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
 * @returns either a profile object (from the MySQL database), or a Promise.reject() with an error message.
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
    if (!response.ok) return Promise.reject(data.errorMessage);
    return data.profile;
  }
  catch (error) {
    return Promise.reject(error);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Cookies
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

export function createProfileCookies(databaseProfile, password) {
  setCookie("profileEmail", databaseProfile.Email, 7);
  setCookie("profilePassword", password, 7);
  setCookie("profilePhoneNumber", databaseProfile.PhoneNumber, 7);
  setCookie("profileVendorID", databaseProfile.VendorID, 7);
}

export function deleteProfileCookies() {
  deleteCookie("profileEmail");
  deleteCookie("profilePassword");
  deleteCookie("profilePhoneNumber");
  deleteCookie("profileVendorID");
}




