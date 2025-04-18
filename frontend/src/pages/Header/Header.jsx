import React from "react";
import { Outlet, Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <div>
      <HeaderContent />
      <Outlet />
    </div>
  );
}

const HeaderContent = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b shadow-md">
      {/* Left Section - Website */}
      <div className="flex items-center">
        <span className="text-lf font-bold">Insert Cool Website Name</span>
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
          <Link to="/products" className="hover:underline">
            Products
          </Link>
        </li>
        <li>
          <Link to="/profile" className="hover:underline">
            Profile
          </Link>
        </li>
        <li>
          <Link to="/help" className="hover:underline">
            Help
          </Link>
        </li>
        <li>
          <Link to="/partners" className="hover:underline">
            For Partners
          </Link>
        </li>
      </ul>

      {/*Right Section - Cart */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-bold">Cart</span>
      </div>
    </nav>
  );
};
