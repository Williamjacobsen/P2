import React from "react";
import { Navigate } from "react-router-dom";

import Products from "./Products";
import useGetProfile from "../Profile/useGetProfile";

export default function Vendor() {

  // Hooks
  const [isLoadingProfile, profile] = useGetProfile();

  // Is the user signed in?
  if (isLoadingProfile) {
    return (<>Loading login...</>);
  }
  else if (profile === undefined) {
    return (<Navigate to="/sign-in" replace />);
  }

  return (
    <div>
      <Products />
    </div>
  );
}
