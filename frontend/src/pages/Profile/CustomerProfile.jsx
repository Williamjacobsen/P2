import React from "react";
import Modal from "../Modal/Modal"

export default function CustomerProfile() {

  // TODO
  // Is user signed in? If not, direct them to the sign in page

  let profile; // = something

  return (
    <>
      <h3>
        --- Profile Information ---
      </h3>
      <b>Email address: </b>
      {/* \n{profile.email} */}
      <br />
      <Modal openButtonText="Change email address?" modalContent={<ChangeEmailAddress />} />
      <br />
      <b>Phone number: </b>
      {/* \n{profile.phoneNumber} */}
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




