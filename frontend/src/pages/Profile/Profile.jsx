import React from "react";
import Modal from "../Modal/Modal"
import { Navigate } from "react-router-dom";
import { createProfileCookies, deleteProfileCookies } from "./SignIn"
import { getCookie } from "../../utils/cookies"
import useCheckLoginValidity from "./useCheckLoginValidity";
import useGetVendor from "./useGetVendor";

export default function Profile() {

  // Vendor info from cookies
  const cookieVendorID = getCookie("profileVendorID");
  const isVendor = (cookieVendorID != "null" && cookieVendorID != null); // "getCookie()" returns either null or a string (which would be "null" if the cookie exists, but the profile has the vendor ID null (so, if the profile is not a vendor)). 
  const bypassUseGetVendor = !isVendor;

  // Custom hooks
  const [isLoadingLogin, isLoginValid] = useCheckLoginValidity();
  const [isLoadingVendor, vendor] = useGetVendor(cookieVendorID, bypassUseGetVendor);

  // Is the user signed in?
  if (isLoadingLogin) {
    return (<>Loading login...</>);
  }
  else if (!isLoginValid) {
    return <Navigate to="/sign-in" />;
  }

  // Is the user a vendor?
  if (isLoadingVendor) {
    return (<>Loading vendor information...</>);
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
      <Modal
        openButtonText="Change email address?"
        modalContent={<ModifyProfileModal
          databasePropertyName="Email"
          labelText="New email: "
          inputType="email" />} />
      <br />
      <Modal
        openButtonText="Change phone number?"
        modalContent={<ModifyProfileModal
          databasePropertyName="PhoneNumber"
          labelText="New phone number: "
          inputType="number" />} />
      <br />
      <Modal
        openButtonText="Change password?"
        modalContent={<ModifyProfileModal
          databasePropertyName="Password"
          labelText="New password "
          inputType="password" />} />
      <br />
      <Modal
        openButtonText="Delete profile?"
        modalContent={(<DeleteProfileModal />)} />
      {
        !isVendor && (
          <>
            {/* //y NOT DONE */}
            not vendor
          </>
        )
      }
      {
        isVendor && (
          <>
            {/* //y NOT DONE */}
            {vendor.Name}
            <br />
            {vendor.Email}
          </>
        )
      }
    </>
  );
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Modals
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

function ModifyProfileModal({ databasePropertyName, labelText, inputType = "text", theMinLength = 0, theMaxLength = 256 }) {
  return (
    <>
      <form onSubmit={modifyProfile}>
        <input type="hidden" name="databasePropertyName" value={databasePropertyName} /> <br />
        <b>
          Current password:
        </b> <br />
        <input type="password" name="password" required /> <br />
        <b>
          {labelText}
        </b> <br />
        <input type={inputType} name="newValue" required minLength={theMinLength} maxLength={theMaxLength} /> <br />
        <input type="submit" value="Apply" />
      </form >
    </>
  );
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

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Events
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

async function modifyProfile(event) {
  try {
    //y TODO: add variable validation
    //y TODO: implement password encryption (right now it is just being sent directly)
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Get data
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const newValue = formData.get("newValue");
    const propertyName = formData.get("databasePropertyName");
    const email = getCookie("profileEmail");
    // Modify profile in server
    const profile = await requestProfileModification(email, password, propertyName, newValue);
    // Create sign in cookie
    createProfileCookies(profile);
    // Reload the page (to refresh changes)
    window.location.reload();
  }
  catch (error) {
    // Alert the user of the error (for example wrong password)
    alert(error);
  }
}

async function deleteProfile(event) {
  try {
    //y TODO: add variable validation
    //y TODO: implement password encryption (right now it is just being sent directly)
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Get data
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const email = getCookie("profileEmail");
    // Delete profile from server
    await requestProfileDeletion(email, password);
    // Delete sign in cookie
    deleteProfileCookies();
    // Reload the page (this navigates to the sign in page because the user is now signed out)
    window.location.reload();
  }
  catch (error) {
    // Alert the user of the error (for example wrong password)
    alert(error);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Requests
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

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
    if (!response.ok) return Promise.reject(data.errorMessage);
    return data.profile;
  }
  catch (error) {
    return Promise.reject(error);
  }
}

/**
 * @param {*} email string
 * @param {*} password string
 * @returns either nothing, or a Promise.reject() with an error message.
 */
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
    if (!response.ok) return Promise.reject(data.errorMessage);
  }
  catch (error) {
    return Promise.reject(error);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Misc
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

function signOut() {
  deleteProfileCookies();
  // Reload the page (this navigates to the sign in page because the user is now signed out)
  window.location.reload();
}




