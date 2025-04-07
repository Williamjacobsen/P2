import React from "react";
import Modal from "../Modal/Modal"
import { Navigate } from "react-router-dom";
import { isSignedIn } from "./SignIn"
import { deleteCookie, getCookie } from "../../tools/cookies"

export default function Profile() {

  //y TODO: This whole thing. It is far from finished yet.

  if (isSignedIn() == false) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <>
      <h3>
        --- Profile Information ---
      </h3>
      <button onClick={signOut}>
        Sign out
      </button>
      <br />
      <b>Email address: </b>
      {getCookie("profileEmail")}
      <br />
      <b>Phone number: </b>
      {getCookie("profilePhoneNumber")}
      <br />
      <Modal openButtonText="Change email address?" modalContent={<ChangeEmailAddress />} />
      <br />
      <Modal openButtonText="Change phone number?" modalContent={<ChangePhoneNumber />} />
      <br />
      <Modal openButtonText="Change password?" modalContent={(<ChangePassword />)} />
    </>
  );
}

function signOut() {
  // Delete profile credential cookies
  deleteCookie("profileEmail");
  deleteCookie("profilePassword");
  deleteCookie("profilePhoneNumber");

  // Reload the page (this navigates to the sign in page because the user is now signed out)
  window.location.reload();
}

function ChangePhoneNumber() {

  return (
    <>

    </>
  );

}

function ChangeEmailAddress() {

  return (
    <>

    </>
  );

}

function ChangePassword() {

  return (
    <>

    </>
  );

}




