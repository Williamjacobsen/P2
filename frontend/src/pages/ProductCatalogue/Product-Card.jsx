import React, { useEffect, useState } from "react";
import "./Product-Card.css";
import { Link } from "react-router-dom";
import FetchImage from "../../utils/getPrimaryImage";

export default function ProductCard({
  id,
  storeName,
  productName,
  price,
  productBrand,
  showVendorButtons,
  onDelete,
}) {
  const image = FetchImage(id);

  return (
    <div className="product-card-container">
      <div
        className="product-card"
        style={{ height: showVendorButtons ? "450px" : "420px" }}
      >
        <Link to={`/product/${id}`} className="product-card-link">
          <img
            src={image || "/Img/MissingImgImg.jpg"}
            alt="Product Image"
          ></img>
          <h1>{storeName}</h1>
          <h1>{`${productBrand} - ${productName}`}</h1>
          <p>{`${price},00 kr`}</p>
        </Link>
        {showVendorButtons && (
          <button onClick={() => onDelete(id)}>Delete</button>
        )}
      </div>
    </div>
  );
}
