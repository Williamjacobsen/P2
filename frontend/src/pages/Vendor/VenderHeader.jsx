import React from "react";
import './Vender-header.css';
import { Link } from "react-router-dom";

const VenderHeader = () => {
    return (
        <header className="vendor-header"> 
            <nav>
                <ul className="nav-list">
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
    );
};

export default VenderHeader;