import React from "react";
import { Outlet, Link } from "react-router-dom";
import "./Header.css";
import SearchBar from "../SearchBar";

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
            Help
          </Link>
        </li>
        <li>
          <Link to="/vendor" className="hover:underline">
            For Partners
          </Link>
        </li>
      </ul>

      {/*Right Section - Cart */}
      <SearchBar/>
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
};
