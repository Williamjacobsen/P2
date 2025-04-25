import React, { useEffect, useState } from "react";
import "./Product-Card.css";
import { Link } from "react-router-dom";
import FetchImage from "../../utils/getPrimaryImage";

export default function ProductCard({ id, storeName, productName, price }) {
  const image = FetchImage(id);

  return (
    <Link to={`/product/${id}`} className="product-card-link">
      <div className="product-card">
        <img src={image || "/Img/MissingImgImg.jpg"} alt="Product Image"></img>
        <h1>{storeName}</h1>
        <h1>{productName}</h1>
        <p>{`${price},00 kr`}</p>
      </div>
    </Link>
  );
}
