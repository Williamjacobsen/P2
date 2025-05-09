import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import "./Profile.css";
import Modal from "../Modal/Modal"
import useGetProfile from "./useGetProfile";
import useGetVendor from "./useGetVendor";
import { requestAccessToken } from "./ReSignInPopUp";

export default function Profile() {

  // Hooks
  const navigate = useNavigate();
  const [isLoadingProfile, profile] = useGetProfile();
  const [isLoadingVendor, vendor] = useGetVendor(profile?.VendorID);

  // Is the user signed in?
  if (isLoadingProfile) {
    return (<>Loading login...</>);
  }
  else if (profile === undefined) {
    return (<Navigate to="/sign-in" replace />);
  }

  // Is the user a vendor?
  if (isLoadingVendor) {
    return (<>Loading vendor information...</>);
  }

  return (
    <>
      <div className="profile-info">
        <h3>
          Profile Information
        </h3>
        <b>Email address: </b>
        {profile.Email}
        <br />
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
        <br />
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
            databasePropertyName="Password" // Note that this is not an actual property in the database (but PasswordHash is).
            labelText="New password "
            inputType="password"
            theMaxLength={500}
          />}
        />
        <br />
        <button onClick={signOut}>
          Sign out
        </button>
        <br />
        <button onClick={signOutAllDevices}>
          Sign out on all devices
        </button>
        <br />
        <Modal
          openButtonText="Delete profile?"
          modalContent={(<DeleteProfileModal />)} />
        {
          vendor !== null && (
            <>
              <h3>
                Vendor Profile Information
              </h3>
              <b>Vendor name: </b>
              {vendor.Name}
              <br />
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
              <b>FAQ: </b>
              <br />
              <div class="text-with-new-lines">
                {vendor.FAQ.replaceAll("newLineCharacter", "\n")}
              </div>
              <br />
              <Modal
                openButtonText="Change FAQ?"
                modalContent={<ModifyModal
                  modificationFunction={modifyVendor}
                  databasePropertyName="FAQ"
                  labelText="New FAQ: "
                  inputType="text"
                  theMaxLength={2000}
                />}
              />
              <br />
              <b>Address: </b>
              {vendor.Address}
              <br />
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
              <br />
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
              <br />
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
              <br />
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
              <br />
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
              <br />
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
      </div>
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
        <textarea type={inputType} name="newValue" required minLength={theMinLength} maxLength={theMaxLength} /> <br />
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
    // Delete profile from server
    await requestProfileDeletion(password);
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
    // Modify profile in server
    await requestProfileModification(password, propertyName, newValue);
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
    let newValue = formData.get("newValue");
    const propertyName = formData.get("databasePropertyName");
    // In case of FAQ, change new lines "\n" to something
    // that gets past the server's input sanitization
    if (propertyName === "FAQ") {
      newValue = newValue.replaceAll("\n", "newLineCharacter");
    }
    // Modify profile in server
    await requestVendorModification(password, propertyName, newValue);
    // Reload the page (to refresh changes)
    window.location.reload();
  }
  catch (error) {
    alert(error);
  }
}

export async function signOut() {
  try {
    await requestSignOut();
    // Reload the page (to refresh changes)
    window.location.reload();
  }
  catch (error) {
    alert(error);
  }
}

async function signOutAllDevices() {
  try {
    await requestSignOutAllDevices();
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
async function requestProfileDeletion(password) {
  try {
    const response = await fetch("http://localhost:3001/profile/delete", {
      method: "POST",
      credentials: "include", // Ensures cookies are sent with the request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is invalid") {
        await requestAccessToken();
        return await requestProfileDeletion(password);
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
 * NOTE: When the propetyName is "Password", there is not an actual property in the database called "Password",
 * but instead a "PasswordHash", but the server handles the hashing itself.
 * @returns either nothing, or a Promise.reject() with an error message.
 */
async function requestProfileModification(password, propertyName, newValue) {
  try {
    const response = await fetch("http://localhost:3001/profile/modify", {
      method: "PUT",
      credentials: "include", // Ensures cookies are sent with the request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        propertyName,
        newValue,
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is invalid") {
        await requestAccessToken();
        return await requestProfileModification(password, propertyName, newValue);
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
async function requestVendorModification(password, propertyName, newValue) {
  try {
    const response = await fetch("http://localhost:3001/vendor/modify", {
      method: "PUT",
      credentials: "include", // Ensures cookies are sent with the request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        propertyName,
        newValue,
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is invalid") {
        await requestAccessToken();
        return await requestVendorModification(password, propertyName, newValue);
      }
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
async function requestSignOut() {
  try {
    const response = await fetch("http://localhost:3001/profile/sign-out-device", {
      method: "POST",
      credentials: "include", // Ensures cookies are sent with the request
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is invalid") {
        await requestAccessToken();
        return await requestSignOut();
      }
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
async function requestSignOutAllDevices() {
  try {
    const response = await fetch("http://localhost:3001/profile/sign-out-all-devices", {
      method: "POST",
      credentials: "include", // Ensures cookies are sent with the request
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is invalid") {
        await requestAccessToken();
        return await requestSignOutAllDevices();
      }
      return Promise.reject(data.error);
    }
  }
  catch (error) {
    return Promise.reject(error);
  }
}




