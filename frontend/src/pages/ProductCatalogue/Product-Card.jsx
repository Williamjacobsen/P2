import React from 'react';
import "./Product-Card.css"
import {Link} from "react-router-dom";

export default function ProductCard({id, storeName, productName, price, imgURL}) {
    return (
        <Link to={`/product/${id}`} className="product-card-link">
            <div className="product-card">
                <img src={imgURL}></img>
                <h1>{storeName}</h1>
                <h1>{productName}</h1>
                <p>{price}DKK</p>
            </div>
        </Link>
    );
}