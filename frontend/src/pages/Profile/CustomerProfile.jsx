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
      <Modal openButtonText="Change email address?" modalContent={<ChangeEmailAddressModal />} />
      <br />
      <b>Phone number: </b>
      {/* \n{profile.phoneNumber} */}
      <br />
      <Modal openButtonText="Change phone number?" modalContent={<ChangePhoneNumberModal />} />
      <br />
      <Modal openButtonText="Change password?" modalContent={(<ChangePasswordModal />)} />
    </>
  );
}

function ChangePhoneNumberModal() {

  return (
    <>

    </>
  );

}

function ChangeEmailAddressModal() {

  return (
    <>

    </>
  );

}

function ChangePasswordModal() {

  return (
    <>

    </>
  );

}




