import React from "react";
import { Outlet } from "react-router-dom";

export default function Header() {
  return (
    <div>
      <h4>Header</h4>
      <Outlet />
    </div>
  );
}
