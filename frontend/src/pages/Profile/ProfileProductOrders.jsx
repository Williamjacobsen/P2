import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useGetProfile from "./useGetProfile";
import { requestAccessToken } from "./ReSignInPopUp";

export default function ProfileProductOrders() {

  // Hooks
  const navigate = useNavigate();
  const [isLoadingProfile, profile] = useGetProfile();
  const [isLoadingOrders, orders] = useGetProfileProductOrders(isLoadingProfile);

  // Is the user signed in?
  if (isLoadingProfile) {
    return (<>Loading login...</>);
  }
  else if (profile === undefined) {
    navigate("/sign-in");
  }

  // Is loading orders?
  if (isLoadingOrders) {
    return (<>Loading order history...</>);
  }
  else if (Object.keys(orders).length === 0) {
    return (<>You have no orders.</>)
  }

  // Sort the orders by IsResolved and secondarily sort by Datetime
  let sortedOrders = orders;
  sortedOrders.sort((a, b) => {
    if (a.IsResolved === 1 && b.IsResolved === 0) return true;
    else if (a.IsResolved === 0 && b.IsResolved === 1) return false;
    else return b.Datetime.localeCompare(a.Datetime);
  })

  //y TODO: Maybe show unresolved and resolved separately?

  return (
    <>
      <h3>
        --- Orders (sorted primarily by resolved and secondarily by time) ---
      </h3>
      {sortedOrders.map((order) => (
        <>
          <b>Has been resolved: </b>
          {order.IsResolved}
          <br />
          <b>Time of purchase: </b>
          {order.DateTime}
          {/* NOTE: A MySQL Datetime also factors in daylight savings time (DST). */}
          <br />
          <b>Product ID: </b>
          {order.ProductID}
          <br />
          <br />
        </>
      ))}
    </>
  );
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Custom hooks
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * Custom hook (which is why the function name starts with "use"). 
 * @returns the object [isLoading (a boolean), orders (an array of JSON objects with orders)].
 */
function useGetProfileProductOrders(isLoadingProfile) {

  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (!isLoadingProfile) { // Before we can use the profile's information, we must ensure that the user is logged in.
          setOrders(await requestProfileProductOrders());
          setIsLoading(false);
        }
      }
      catch (error) {
        alert(error);
      }
    })();
  }, [isLoadingProfile]); // If the state "isLoadingProfile" changes (so, once the profile gets validated), we must run this useEffect again. 

  return [isLoading, orders];
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Requests
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * @returns either null, an array of product order objects (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestProfileProductOrders() {
  try {
    // Get data from the form to server
    const response = await fetch("http://localhost:3001/productOrder/getProfileProductOrders", {
      method: "GET",
      credentials: "include", // Ensures cookies are sent with the request
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) {
      if (data.error === "Access token is invalid") {
        await requestAccessToken();
        return await requestProfileProductOrders();
      }
      else {
        return Promise.reject(data.error);
      }
    }
    return data.productOrders;
  }
  catch (error) {
    return Promise.reject(error);
  }
}
