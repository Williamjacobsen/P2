import React from "react";
import { Navigate } from "react-router-dom";

import Products from "./Products";
import useGetProfile from "../Profile/useGetProfile";
import useGetVendor from "../Profile/useGetVendor";

export default function Vendor() {

  // Hooks
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
  else if (vendor === null) {
    return (<>You are not a vendor, so you do not have access to this page.</>);
  }

  return (
    <div>
      <Products VendorID={profile.VendorID}/>
    </div>
  );
}
