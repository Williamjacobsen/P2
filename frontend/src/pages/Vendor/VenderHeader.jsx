import React from "react";
import './VenderHeader.css';
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

const VenderHeader = () => {
    return (
        <div>
        <header className="vendor-header"> 
            <nav>
                <ul className="nav-list">
                    <li>
                        <Link to="/">Back</Link>
                    </li>
                    <li>
                        <Link to="/products">Products</Link>
                    </li>
                    <li>
                        <Link to="/orders">Orders</Link>
                    </li>
                    <li>
                        <Link to="/profile">Profile</Link>
                    </li>
                </ul>
            </nav>
        </header>
    <Outlet />
        </div>
    );
};

export default VenderHeader;