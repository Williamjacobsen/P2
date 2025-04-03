// Tutorial on how to use forms in React: https://www.youtube.com/watch?v=SaEc7jLWvGY

import React from "react";
import Modal from "../Modal/Modal"

export default function CustomerSignIn() {

  //y TODO: Include functionality to add cookie storing user profile

  //y TODO: implement password encryption (right now it is just being sent directly)

  return (
    <>
      <h3>--- Sign In ---</h3>
      <form onSubmit={attemptSignIn}>
        <b>
          Username or email address:
        </b> <br />
        <input name="username" /> <br />
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

    //y TODO: add variable validation

    // Prevent page from refreshing on submit
    event.preventDefault();

    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    // Post form data to server
    const response = await fetch("http://localhost:3001/sign-in-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error("Failed to sign in.");

    response.json().then((data) => {
      console.log(data.profile.ID);
      console.log(data.profile.Username);
    });

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