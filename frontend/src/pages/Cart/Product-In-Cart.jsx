import React, { useEffect, useState } from "react";
import "./Cart.css";
import FetchImage from "../../utils/getPrimaryImage";

function ProductInCart({
  id,
  storeName,
  storeAddress,
  quantity,
  size,
  productName,
  price,
  removeFunction,
}) {
  const image = FetchImage(id);

  return (
    <div className={"cartProduct"}>
      <img
        src={image || "/Img/MissingImgImg.jpg"}
        className={"cartImg"}
        alt={productName}
      ></img>
      <div className={"cartText"}>
        <h1>{storeName}</h1>
        <h2>{storeAddress}</h2>
        <p>{productName}</p>
        <p>{size}</p>
        <h1>{`${price},00 kr`}</h1>
        <h1>{quantity}</h1>
      </div>
      <div className={"cartRemove"}>
        <button className={"cartRemoveButton"} onClick={removeFunction}>
          Remove
        </button>
      </div>
    </div>
  );
}

export default ProductInCart;
