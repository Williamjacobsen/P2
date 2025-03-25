import React from 'react';
import "./Product-Card.css"

export default function ProductCard({storeName, productName, price, imgURL}) {
    return (
        <div className="product-card">
            <img src={imgURL}></img>
            <h1>{storeName}</h1>
            <h1>{productName}</h1>
            <p>{price}DKK</p>
        </div>
    );
}