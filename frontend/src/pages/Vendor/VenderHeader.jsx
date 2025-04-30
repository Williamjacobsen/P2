import React from "react";
import { Link, Outlet } from "react-router-dom"; 
import './VenderHeader.css';

const VenderHeader = () => {
  return (
    <div>
      <header className="vendor-header">
        <nav>
          <ul className="nav-list">
            <li><Link to="/">Back</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li>
              <Link to="/add-faq" className="add-faq-button">
                Add FAQ
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <Outlet />
    </div>
  );
};

export default VenderHeader;
