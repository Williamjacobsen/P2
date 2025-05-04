// Tutorial on building sticky headers: https://www.youtube.com/watch?v=puwPc9W5Qw8
// Turotial on building headers: https://www.youtube.com/watch?v=f3uCSh6LIY0

import React, { version } from "react";
import { Outlet, Link } from "react-router-dom";
import "./Header.css";

import useGetProfile from "../Profile/useGetProfile";
import useGetVendor from "../Profile/useGetVendor";

export default function Header() {
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
      <DefaultHeader profile={profile} />
      <VendorHeader vendor={vendor} />
      <Outlet />
    </div>
  );
}

function DefaultHeader({ profile }) {
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
            <Link to="/cart"> Cart </Link>{" "}
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
              <Link to="vendor/orders"> Orders </Link>{" "}
            </li>
            <li>
              {" "}
              <Link to="/NOT IMPLEMENTED">
                {" "}
                Coupons (NOT IMPLEMENTED){" "}
              </Link>{" "}
            </li>
          </ul>
        </div>
        <div>{/* This is left empty for styling purposes*/}</div>
      </header>
    </>
  );
}

//r
function OldDefaultHeader() {
  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b shadow-md">
      {/* Left Section - Website name */}
      <div className="flex items-center">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          <span className="text-lf font-bold">Aalborg Clothing Shops</span>
        </Link>
        <span className="mx-4 border-l h-6"></span> {/* Vertical Separator */}
      </div>

      {/* Center Section - Navigation Links */}
      <ul className="flex space-x-6 text-sm">
        <li>
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link to="/Product-Catalogue" className="hover:underline">
            Products
          </Link>
        </li>
        <li>
          <Link to="/profile" className="hover:underline">
            Profile
          </Link>
        </li>
        <li>
          <Link to="/FAQ" className="hover:underline">
            FAQ
          </Link>
        </li>
        <li>
          <Link to="/vendor" className="hover:underline">
            For Partners
          </Link>
        </li>
      </ul>

      {/*Right Section - Cart */}
      <ul>
        <li>
          <div className="flex items-center space-x-2">
            <Link to="/Cart" className="hover:underline">
              <span className="text-sm font-bold">Cart</span>
            </Link>
          </div>
        </li>
      </ul>
    </nav>
  );
}
