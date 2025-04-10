import React from "react";
import Modal from "../Modal/Modal"
import { Navigate } from "react-router-dom";
import { isSignedIn } from "./SignIn"
import { deleteCookie, setCookie, getCookie } from "../../utils/cookies"

export default function Profile() {

  // Not signed in?
  if (isSignedIn() === false) {
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
      <Modal openButtonText="Change email address?" modalContent={<ChangeEmailAddressModal />} />
      <br />
      <Modal openButtonText="Change phone number?" modalContent={<ChangePhoneNumberModal />} />
      <br />
      <Modal openButtonText="Change password?" modalContent={(<ChangePasswordModal />)} />
      <br />
      <Modal openButtonText="Delete profile?" modalContent={(<DeleteProfileModal />)} />
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

function DeleteProfileModal() {
  return (
    <>
      <form onSubmit={deleteProfile}>
        <b>
          Current password:
        </b> <br />
        <input type="password" name="password" required /> <br />
        <input type="submit" value="Delete profile" />
      </form >
    </>
  )
}

async function deleteProfile(event) {
  try {

    //y TODO: add variable validation

    //y TODO: implement password encryption (right now it is just being sent directly)

    // Prevent page from refreshing on submit
    event.preventDefault();

    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");

    const email = getCookie("profileEmail");

    // Delete profile from server
    await requestProfileDeletion(email, password);

    // Delete sign in cookie
    deleteCookie("profileEmail");
    deleteCookie("profilePassword");
    deleteCookie("profilePhoneNumber");

    // Reload the page (this navigates to the sign in page because the user is now signed out)
    window.location.reload();
  }
  catch (error) {
    // Alert the user of the error (for example wrong password)
    alert(error);
  }
}

async function requestProfileDeletion(email, password) {
  try {

    //y TODO: implement password encryption (right now it is just being sent directly)

    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/delete", {
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
      return Promise.reject(data.errorMessage);
    }
  }
  catch (error) {
    return Promise.reject(error);
  }
}


function ChangePhoneNumberModal() {

  return (
    <>
      <form onSubmit={modifyProfile}>
        <input type="hidden" name="databasePropertyName" value="PhoneNumber" /> <br />
        <b>
          Current password:
        </b> <br />
        <input type="password" name="password" required /> <br />
        <b>
          New phone number:
        </b> <br />
        <input name="newValue" required minLength={8} maxLength={16} /> <br />
        <input type="submit" value="Apply" />
      </form >
    </>
  );

}

function ChangeEmailAddressModal() {

  return (
    <>
      <form onSubmit={modifyProfile}>
        <input type="hidden" name="databasePropertyName" value="Email" /> <br />
        <b>
          Current password:
        </b> <br />
        <input type="password" name="password" required /> <br />
        <b>
          New email:
        </b> <br />
        <input name="newValue" required /> <br />
        <input type="submit" value="Apply" />
      </form >
    </>
  );
}

function ChangePasswordModal() {

  return (
    <>
      <form onSubmit={modifyProfile}>
        <input type="hidden" name="databasePropertyName" value="Password" /> <br />
        <b>
          Current password:
        </b> <br />
        <input type="password" name="password" required /> <br />
        <b>
          New password:
        </b> <br />
        <input type="password" name="newValue" required /> <br />
        <input type="submit" value="Apply" />
      </form >
    </>
  );
}

async function modifyProfile(event) {
  try {

    //y TODO: add variable validation

    //y TODO: implement password encryption (right now it is just being sent directly)

    // Prevent page from refreshing on submit
    event.preventDefault();

    // Extract data from the form
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const newValue = formData.get("newValue");
    const propertyName = formData.get("databasePropertyName");

    const email = getCookie("profileEmail");

    // Modify profile in server
    const profile = await requestProfileModification(email, password, propertyName, newValue);

    // Create sign in cookie
    setCookie("profileEmail", profile.Email, 7);
    setCookie("profilePassword", profile.Password, 7);
    setCookie("profilePhoneNumber", profile.PhoneNumber, 7);

    // Reload the page (to refresh changes)
    window.location.reload();
  }
  catch (error) {
    // Alert the user of the error (for example wrong password)
    alert(error);
  }
}

async function requestProfileModification(email, password, propertyName, newValue) {
  try {

    //y TODO: implement password encryption (right now it is just being sent directly)

    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/modify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        propertyName,
        newValue,
      }),
    });

    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      return Promise.reject(data.errorMessage);
    }
    return data.profile;
  }
  catch (error) {
    return Promise.reject(error);
  }
}



