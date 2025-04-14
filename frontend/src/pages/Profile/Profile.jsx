import React from "react";
import Modal from "../Modal/Modal"
import { useNavigate } from "react-router-dom";
import { createProfileCookies, deleteProfileCookies } from "./SignIn"
import { getCookie } from "../../utils/cookies"
import useCheckLoginValidity from "./useCheckLoginValidity";
import useGetVendor from "./useGetVendor";

export default function Profile() {

  // Vendor info from cookies
  const cookieVendorID = getCookie("profileVendorID");
  const isVendor = (cookieVendorID !== "null" && cookieVendorID !== null); // "getCookie()" returns either null or a string (which would be "null" if the cookie exists, but the profile has the vendor ID null (so, if the profile is not a vendor)). 
  const bypassUseGetVendor = !isVendor;

  // Hooks
  const navigate = useNavigate();
  const [isLoadingLogin, isLoginValid] = useCheckLoginValidity();
  const [isLoadingVendor, vendor] = useGetVendor(cookieVendorID, bypassUseGetVendor);

  // Is the user signed in?
  if (isLoadingLogin) {
    return (<>Loading login...</>);
  }
  else if (!isLoginValid) {
    navigate("/sign-in");
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
      <button onClick={() => navigate("/profile-product-orders")}>
        Go to order history
      </button>
      <br />
      <b>Email address: </b>
      {getCookie("profileEmail")}
      <Modal
        openButtonText="Change email address?"
        modalContent={<ModifyModal
          modificationFunction={modifyProfile}
          databasePropertyName="Email"
          labelText="New email: "
          inputType="email"
          theMaxLength={150}
        />}
      />
      <br />
      <b>Phone number: </b>
      {getCookie("profilePhoneNumber")}
      <Modal
        openButtonText="Change phone number?"
        modalContent={<ModifyModal
          modificationFunction={modifyProfile}
          databasePropertyName="PhoneNumber"
          labelText="New phone number: "
          inputType="text"
          theMinLength={8}
          theMaxLength={16}
        />}
      />
      <br />
      <Modal
        openButtonText="Change password?"
        modalContent={<ModifyModal
          modificationFunction={modifyProfile}
          databasePropertyName="Password"
          labelText="New password "
          inputType="password"
          theMaxLength={500}
        />}
      />
      <br />
      <Modal
        openButtonText="Delete profile?"
        modalContent={(<DeleteProfileModal />)} />
      {
        isVendor && (
          <>
            <h3>
              --- Vendor Profile Information ---
            </h3>
            <b>Vendor name: </b>
            {vendor.Name}
            <Modal
              openButtonText="Change vendor name?"
              modalContent={<ModifyModal
                modificationFunction={modifyVendor}
                databasePropertyName="Name"
                labelText="New vendor name: "
                inputType="text"
                theMaxLength={100}
              />}
            />
            <br />
            <b>Address: </b>
            {vendor.Address}
            <Modal
              openButtonText="Change address?"
              modalContent={<ModifyModal
                modificationFunction={modifyVendor}
                databasePropertyName="Address"
                labelText="New address: "
                inputType="text"
                theMaxLength={150}
              />}
            />
            <br />
            <b>Public contact email address: </b>
            {vendor.Email}
            <Modal
              openButtonText="Change public contact email address?"
              modalContent={<ModifyModal
                modificationFunction={modifyVendor}
                databasePropertyName="Email"
                labelText="New public contact email: "
                inputType="email"
                theMaxLength={150}
              />}
            />
            <br />
            <b>Public contact phone number: </b>
            {vendor.PhoneNumber}
            <Modal
              openButtonText="Change public contact phone number?"
              modalContent={<ModifyModal
                modificationFunction={modifyVendor}
                databasePropertyName="PhoneNumber"
                labelText="New public contact phone number: "
                inputType="text"
                theMinLength={8}
                theMaxLength={16}
              />}
            />
            <br />
            <b>Public vendor description: </b>
            "{vendor.Description}"
            <Modal
              openButtonText="Change public vendor description?"
              modalContent={<ModifyModal
                modificationFunction={modifyVendor}
                databasePropertyName="Description"
                labelText="New description: "
                inputType="text"
                theMaxLength={500}
              />}
            />
            <br />
            <b>Bank account number: </b>
            {vendor.BankAccountNumber}
            <Modal
              openButtonText="Change bank account number?"
              modalContent={<ModifyModal
                modificationFunction={modifyVendor}
                databasePropertyName="BankAccountNumber"
                labelText="New bank account number: "
                inputType="text"
              />}
            />
            <br />
            <b>CVR number: </b>
            {vendor.CVR}
            <Modal
              openButtonText="Change CVR number?"
              modalContent={<ModifyModal
                modificationFunction={modifyVendor}
                databasePropertyName="CVR"
                labelText="New CVR number: "
                inputType="text"
                theMinLength={8}
                theMaxLength={8}
              />}
            />
            <br />
          </>
        )
      }
    </>
  );
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Modals content
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

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

function ModifyModal({ modificationFunction, databasePropertyName, labelText, inputType = "text", theMinLength = 0, theMaxLength = 256 }) {
  return (
    <>
      <form onSubmit={modificationFunction}>
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

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Events
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

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

async function modifyVendor(event) {
  try {
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
    await requestVendorModification(email, password, propertyName, newValue);
    // Reload the page (to refresh changes)
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

/**
 * @returns either a profile object (from the MySQL database), or a Promise.reject() with an error message.
 */
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
 * @returns either a vendor object (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestVendorModification(email, password, propertyName, newValue) {
  try {
    //y TODO: implement password encryption (right now it is just being sent directly)
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/vendor/modify", {
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
    return data.vendor;
  }
  catch (error) {
    return Promise.reject(error);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Helpers
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

function signOut() {
  deleteProfileCookies();
  // Reload the page (this navigates to the sign in page because the user is now signed out)
  window.location.reload();
}




