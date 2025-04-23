import React from "react";
import { useNavigate, Navigate } from "react-router-dom";

import Modal from "../Modal/Modal"
import { deleteLoginCookies } from "./SignIn"
import { getCookie } from "../../utils/cookies"
import useGetProfile from "./useGetProfile";
import useGetVendor from "./useGetVendor";
import { requestAccessToken } from "./SignIn";

export default function Profile() {

  // Hooks
  const navigate = useNavigate();
  const [isLoadingProfile, profile] = useGetProfile(getCookie("profileAccessToken"));
  const [isLoadingVendor, vendor] = useGetVendor(profile?.VendorID);

  // Is the user signed in?
  if (isLoadingProfile) {
    return (<>Loading login...</>);
  }
  else if (profile === null) {
    return (<Navigate to="/sign-in" replace />);
  }

  // Is the user a vendor?
  if (isLoadingVendor) {
    return (<>Loading vendor information...</>);
  }

  return (
    <>
      <button onClick={signOut}>
        Sign out
      </button>
      <br />
      <button onClick={signOutAllDevices}>
        Sign out on all devices
      </button>
      <br />
      <button onClick={() => navigate("/profile-product-orders")}>
        Go to order history
      </button>
      <h3>
        --- Profile Information ---
      </h3>
      <b>Email address: </b>
      {profile.Email}
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
      {profile.PhoneNumber}
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
          databasePropertyName="PasswordHash" // Note that this is not an actual property in the database. 
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
        vendor !== null && (
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
// Modal content
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
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Get data
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const profileAccessToken = getCookie("profileAccessToken");
    // Delete profile from server
    await requestProfileDeletion(profileAccessToken, password);
    // Delete sign in cookie
    deleteLoginCookies();
    // Reload the page (this navigates to the sign in page because the user is now signed out)
    window.location.reload();
  }
  catch (error) {
    alert(error);
  }
}

async function modifyProfile(event) {
  try {
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Get data
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const newValue = formData.get("newValue");
    const propertyName = formData.get("databasePropertyName");
    const profileAccessToken = getCookie("profileAccessToken");
    // Modify profile in server
    await requestProfileModification(profileAccessToken, password, propertyName, newValue);
    // Reload the page (to refresh changes)
    window.location.reload();
  }
  catch (error) {
    alert(error);
  }
}

async function modifyVendor(event) {
  try {
    // Prevent page from refreshing on submit
    event.preventDefault();
    // Get data
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const newValue = formData.get("newValue");
    const propertyName = formData.get("databasePropertyName");
    const profileAccessToken = getCookie("profileAccessToken");
    // Modify profile in server
    await requestVendorModification(profileAccessToken, password, propertyName, newValue);
    // Reload the page (to refresh changes)
    window.location.reload();
  }
  catch (error) {
    alert(error);
  }
}

async function signOut() {
  try {
    await requestSignOut(getCookie("profileRefreshToken"));
    deleteLoginCookies();
    // Reload the page (to refresh changes)
    window.location.reload();
  }
  catch (error) {
    alert(error);
  }
}

async function signOutAllDevices() {
  try {
    await requestSignOutAllDevices(getCookie("profileRefreshToken"));
    deleteLoginCookies();
    // Reload the page (to refresh changes)
    window.location.reload();
  }
  catch (error) {
    alert(error);
  }
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Requests
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * @returns either nothing, or a Promise.reject() with an error message.
 */
async function requestProfileDeletion(accessToken, password) {
  try {
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
        password,
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is expired.") {
        const newAccessToken = await requestAccessToken(getCookie("profileRefreshToken"));
        return await requestProfileDeletion(newAccessToken, password);
      }
      else {
        return Promise.reject(data.error);
      }
    }
  }
  catch (error) {
    return Promise.reject(error);
  }
}

/**
 * NOTE: When the propetyName is "PasswordHash", the newValue is not actually a hashed password,
 * but instead just a password in plain text, since the server handles the hashing itself.
 * @returns either a profile object (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestProfileModification(accessToken, password, propertyName, newValue) {
  try {
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/modify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
        password,
        propertyName,
        newValue,
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is expired.") {
        const newAccessToken = await requestAccessToken(getCookie("profileRefreshToken"));
        return await requestProfileModification(newAccessToken, password, propertyName, newValue);
      }
      else {
        return Promise.reject(data.error);
      }
    }
  }
  catch (error) {
    return Promise.reject(error);
  }
}

/**
 * @returns either a vendor object (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestVendorModification(accessToken, password, propertyName, newValue) {
  try {
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/vendor/modify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
        password,
        propertyName,
        newValue,
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is expired.") {
        const newAccessToken = await requestAccessToken(getCookie("profileRefreshToken"));
        return await requestVendorModification(newAccessToken, password, propertyName, newValue);
      }
      else {
        return Promise.reject(data.error);
      }
    }
  }
  catch (error) {
    return Promise.reject(error);
  }
}

/**
 * @returns either nothing, or a Promise.reject() with an error message.
 */
async function requestSignOut(refreshToken) {
  try {
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/sign-out-device", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      return Promise.reject(data.error);
    }
  }
  catch (error) {
    return Promise.reject(error);
  }
}

/**
 * @returns either nothing, or a Promise.reject() with an error message.
 */
async function requestSignOutAllDevices(refreshToken) {
  try {
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/profile/sign-out-all-devices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      return Promise.reject(data.error);
    }
  }
  catch (error) {
    return Promise.reject(error);
  }
}




