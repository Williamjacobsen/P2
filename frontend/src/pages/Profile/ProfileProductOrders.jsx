import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCheckLoginValidity from "./useCheckLoginValidity";
import { getCookie } from "../../utils/cookies"

export default function ProfileProductOrders() {

  // Hooks
  const navigate = useNavigate();
  const [isLoadingLogin, isLoginValid] = useCheckLoginValidity();
  const [isLoadingOrders, orders] = useGetProfileProductOrders(isLoginValid);

  // Is the user signed in?
  if (isLoadingLogin) {
    return (<>Loading login...</>);
  }
  else if (!isLoginValid) {
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
 * @returns the object [isLoading (a boolean), orders (an array of objects with orders)].
 */
function useGetProfileProductOrders(isLoginValidated) {

  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (isLoginValidated) { // Before we can use the profile's information, we must ensure that the user is logged in.
          const profileAccessToken = getCookie("profileAccessToken");
          setOrders(await requestProfileProductOrders(profileAccessToken));
          setIsLoading(false);
        }
      }
      catch (error) {
        alert(error);
      }
    })();
  }, [isLoginValidated]); // If the state "isLoginValidated" changes (so, once the profile gets validated), we must run this useEffect again. 

  return [isLoading, orders];
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// Requests
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/**
 * @returns either a vendor object (from the MySQL database), or a Promise.reject() with an error message.
 */
async function requestProfileProductOrders(accessToken) {
  try {
    //y TODO: implement password encryption (right now it is just being sent directly)
    // Post data from the form to server
    const response = await fetch("http://localhost:3001/productOrder/getProfileProductOrders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken
      }),
    });
    // Handle server response
    const data = await response.json();
    if (!response.ok) return Promise.reject(data.errorMessage);
    return data.productOrders;
  }
  catch (error) {
    return Promise.reject(error);
  }
}
