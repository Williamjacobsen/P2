import React from "react";
import Modal from "../Modal/Modal"

export default function CustomerSignIn() {

  // TODO: Include functionality to add cookie storing user profile

  return (
    <>
      <h3>--- Sign In ---</h3>
      <b>
        Username or email address:
      </b>
      <br />
      <input />
      <br />
      <b>
        Password:
      </b>
      <br />
      <input type="password" />
      <br />
      <br />
      Not already a member?
      <br />
      <Modal openButtonText="Sign up" modalContent={<SignUp />} />
    </>
  );
}

function SignUp() {

  return (
    <>
      Test
    </>
  )

}