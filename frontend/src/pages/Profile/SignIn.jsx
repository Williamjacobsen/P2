// Tutorial on how to use forms in React: https://www.youtube.com/watch?v=SaEc7jLWvGY

import React from "react";
import { Navigate } from "react-router-dom";
import Modal from "../Modal/Modal"
import useGetProfile from "./useGetProfile";
import "./Profile.css";

export default function SignIn() {

  // Hooks
  const [isLoadingProfile, profile] = useGetProfile();

  // Is the user already signed in?
  if (isLoadingProfile) {
    return (<>Loading login...</>);
  }
  else if (profile !== undefined) {
    return (<Navigate to="/profile" replace />);
  }

  return (
    <>
      <div className="Background">
        <h3> Sign In </h3>
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
      </div>
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
    // Get authetification tokens from server
    await requestSignIn(email, password);
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
    await requestProfileCreation(email, password, phoneNumber);
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
 * Tries to create a new profile on the server and then get 
 * a profile refresh token cookie and a profile access token cookie from the backend.
 * @param {*} email string
 * @param {*} password string
 * @param {*} phoneNumber int
 * @returns either nothing, or a Promise.reject() with an error message.
 */
async function requestProfileCreation(email, password, phoneNumber) {
  try {
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
  }
  catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Tries to get a profile refresh token cookie and a profile access token cookie from the backend.
 * @returns either nothing, or a Promise.reject() with an error message.
 */
export async function requestSignIn(email, password) {
  try {
    const response = await fetch("http://localhost:3001/profile/sign-in", {
      method: "POST",
      credentials: "include", // Ensures cookies are sent with the request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password
      }),
    });
    // Handle server response
    const data = await response?.json();
    if (!response.ok) {

      return Promise.reject(data.error);
    }
  }
  catch (error) {
    return Promise.reject(error);
  }
}




