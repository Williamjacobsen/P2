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
  onEdit,
  onDelete,
  discount,
}) {
  const image = FetchImage(id);
  const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;

  return (
    <div className="product-card-container" role={"product-card"}>
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
          {/* used a short circuit logical expression the paragraph only shows if there is a discount */}
          {discount > 0 && <p>-{discount}%</p>}
          <div className="price-container">
            {discount > 0 && (
              <p className="old-price">{`${price.toFixed(2)} kr`}</p>
            )}
            <p className="new-price">{`${finalPrice.toFixed(2)} kr`}</p>
          </div>
        </Link>
        {showVendorButtons && (
          <>
            <button onClick={() => onEdit(id)}>Edit</button>
            <button onClick={() => onDelete(id)}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}
