import React from 'react';
import "./Product-Card.css"

export default function ProductCard({storeName, productName, price}) {
    return (
        <div className="Product-Card">
            <h1>{storeName}</h1>
            <h1>{productName}</h1>
            <p>{price}DKK</p>
        </div>
    );
}