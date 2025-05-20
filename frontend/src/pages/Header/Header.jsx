// Tutorial on building sticky headers: https://www.youtube.com/watch?v=puwPc9W5Qw8
// Turotial on building headers: https://www.youtube.com/watch?v=f3uCSh6LIY0

import React, { useEffect, useState, version } from "react";
import { Outlet, Link } from "react-router-dom";
import "./Header.css";
import { AmountOfItemsInCart } from "../../utils/AmountOfItemsInCart";

import useGetProfile from "../Profile/useGetProfile";
import useGetVendor from "../Profile/useGetVendor";

import {getAllCookieProducts} from "../../utils/cookies";

export default function Header({ cartAmount, setCartAmount }) {

  useEffect(() => {
    setCartAmount(AmountOfItemsInCart());
  }, [])



  // Hooks
  const [isLoadingProfile, profile] = useGetProfile();
  const [isLoadingVendor, vendor] = useGetVendor(profile?.VendorID);


  // Is the user signed in?
  if (isLoadingProfile) {
    return <>Loading login...</>;
  }
  // Is the user signed in?
  if (isLoadingVendor) {
    return <>Loading vendor profile information...</>;
  }

  return (
    <div>
      <DefaultHeader profile={profile} cartAmount={cartAmount} />
      <VendorHeader vendor={vendor} />
      <Outlet />
    </div>
  );
}

function DefaultHeader({ profile, cartAmount }) {
  return (
    <header class="default-header sticky" style={{ zIndex: 99 }}>
      <div>
        <ul>
          <li>
            {" "}
            <Link to="/"> Website name </Link>{" "}
          </li>
        </ul>
      </div>
      <div>
        <ul>
          <li>
            {" "}
            <Link to="/product-catalogue"> Products </Link>{" "}
          </li>
          <li>
            {" "}
            <Link to="/faq"> Help </Link>{" "}
          </li>
          {profile === undefined && (
            <>
              <li>
                {" "}
                <Link to="/sign-in"> Sign In </Link>{" "}
              </li>
            </>
          )}
          {profile !== undefined && (
            <>
              <li>
                {" "}
                <Link to="/profile"> Profile </Link>{" "}
              </li>
              <li>
                {" "}
                <Link to="/profile-product-orders"> Your Orders </Link>{" "}
              </li>
            </>
          )}
        </ul>
      </div>
      <div>
        <ul>
          <li>
            {" "}
            <Link to="/cart"> Cart: {cartAmount}</Link>{" "}
          </li>
        </ul>
      </div>
    </header>
  );
}

function VendorHeader({ vendor }) {
  if (vendor === null) {
    return;
  }

  return (
    <>
      <header class="vendor-header sticky" style={{ zIndex: 99 }}>
        <div>
          <ul>
            <li>
              {" "}
              <b>Vendor: </b> {vendor.Name}{" "}
            </li>
          </ul>
        </div>
        <div>
          <ul>
            <li>
              {" "}
              <Link to="/vendor"> Products </Link>{" "}
            </li>
            <li>
              {" "}
              <Link to="/vendor/add-product"> Add Product </Link>{" "}
            </li>
            <li>
              {" "}
              <Link to="/vendor/orders"> Orders </Link>{" "}
            </li>
            <li>
              {" "}
              <Link to="/vendor/coupons"> Coupons </Link>{" "}
            </li>
          </ul>
        </div>
        <div>{/* This is left empty for styling purposes*/}</div>
      </header>
    </>
  );
}