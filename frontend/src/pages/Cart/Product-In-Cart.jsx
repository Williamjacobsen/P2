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
  discount
}) {
  const image = FetchImage(id);
  const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;

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
          {discount > 0 && <h1>-{discount}%</h1>}
        <h1>{`${finalPrice.toFixed(0)},00 kr`}</h1>
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
