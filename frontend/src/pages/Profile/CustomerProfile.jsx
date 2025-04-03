import React from "react";
import Modal from "../Modal/Modal"
import { Navigate } from "react-router-dom";

export default function CustomerProfile() {

  //y TODO: This whole thing. It is far from finished yet.

  try {
    //y TODO: Is user signed in? If not, direct them to the sign in page
  }
  catch {
    return <Navigate to="/sign-in" />;
  }

  let profile; // TODO = something

  return (
    <>
      <h3>
        --- Profile Information ---
      </h3>
      <b>Email address: </b>
      {/* \n{profile.email} */}
      <br />
      <b>Phone number: </b>
      {/* \n{profile.phoneNumber} */}
      <br />
      <Modal openButtonText="Change email address?" modalContent={<ChangeEmailAddress />} />
      <br />
      <Modal openButtonText="Change phone number?" modalContent={<ChangePhoneNumber />} />
      <br />
      <Modal openButtonText="Change password?" modalContent={(<ChangePassword />)} />
    </>
  );
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




