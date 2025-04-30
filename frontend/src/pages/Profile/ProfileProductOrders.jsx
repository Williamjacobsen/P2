import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGetProfile from "./useGetProfile";
import { requestAccessToken } from "./ReSignInPopUp";
import "./Profile.css";
import usePages from "../../utils/usePages";

const ordersPerPage = 5;

export default function ProfileProductOrders() {

  // Hooks
  const navigate = useNavigate();
  const [isLoadingProfile, profile] = useGetProfile();
  const [isLoadingOrders, sortedOrders] = useGetSortedProfileProductOrders(isLoadingProfile);
  const [getVisiblePartOfPageArray, CurrentPageDisplay, PreviousPageButton, NextPageButton] = usePages(sortedOrders, ordersPerPage);

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
  else if (Object.keys(sortedOrders).length === 0) {
    return (<>You have no orders.</>)
  }

  return (
    <>
      <div className="orders-section">
        <CurrentPageDisplay />
        <PreviousPageButton />
        <NextPageButton />
        <h3>
          Orders
        </h3>
        {getVisiblePartOfPageArray().map((order) => (
          <>
            <b>Has been collected: </b>
            {order.IsCollected}
            <br />
            <b>Ready to be collected: </b>
            {order.IsReady}
            <br />
            <b>Time of purchase: </b>
            {order.DateTimeOfPurchase}
            {/* NOTE: A MySQL DateTime also factors in daylight savings time (DST). */}
            <br />
            <b>Order ID: </b>
            {order.ID}
            <br />
            <b>Name of vendor: </b>
            {order.VendorName}
            <br />
            <b>CVR of vendor: </b>
            {order.VendorCVR}
            <br />
            <b>Name of brand: </b>
            {order.ProductBrand}
            <br />
            <b>Name of product: </b>
            {order.ProductName}
            <br />
            <b>Type of clothing: </b>
            {order.ProductClothingType}
            <br />
            <b>Size: </b>
            {order.ProductSize}
            <br />
            <b>Gender: </b>
            {order.ProductGender}
            <br />
            <b>Price: </b>
            {order.ProductPrice} DKK
            <br />
            <hr />
          </>
        ))}
      </div>
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
function useGetSortedProfileProductOrders(isLoadingProfile) {

  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (!isLoadingProfile) { // Before we can use the profile's information, we must ensure that the user is logged in.
          let orders = await requestProfileProductOrders();
          // Sort the orders by !IsCollected, then IsReady, then Datetime
          setOrders(orders.sort((a, b) => {
            if (a.IsCollected === 1 && b.IsCollected === 0) return true;
            else if (a.IsCollected === 0 && b.IsCollected === 1) return false;
            else if (a.IsReady === 1 && b.IsReady === 0) return false;
            else if (a.IsReady === 0 && b.IsReady === 1) return true;
            else return b.DateTimeOfPurchase.localeCompare(a.DateTimeOfPurchase);
          }));
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

