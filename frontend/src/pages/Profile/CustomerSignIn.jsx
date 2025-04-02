// Tutorial on how to use forms in React: https://www.youtube.com/watch?v=SaEc7jLWvGY

import React from "react";
import Modal from "../Modal/Modal"

export default function CustomerSignIn() {

  // TODO: Include functionality to add cookie storing user profile

  // TODO: implement password encryption (right now it is just being sent directly)

  return (
    <>
      <h3>--- Sign In ---</h3>
      <form onSubmit={attemptSignIn}>
        <b>
          Username or email address:
        </b> <br />
        <input name="email" /> <br />
        <b>
          Password:
        </b> <br />
        <input type="password" name="password" /> <br />
        <input id="submit_id" type="submit" value="Sign in"></input>
      </form >

      <br />
      Not already a member ?
      <br />
      <Modal openButtonText="Sign up" modalContent={<SignUp />} />
    </>
  );
}

async function attemptSignIn(event) {
  try {

    // TODO: add variable validation

    // Prevent page from refreshing on submit
    event.preventDefault();

    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")
    const password = formData.get("password")

    // Post form data to server
    const response = await fetch("http://localhost:3001/sign-in-customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) throw new Error("Failed to sign in.");

    //r NOT FINISHED
  }
  catch (error) {
    console.error("Error:", error);
    alert("Error signing in.");
  }
}

function SignUp() {

  return (
    <>
      Test
    </>
  )

}