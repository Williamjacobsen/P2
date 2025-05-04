import React from "react";
import "./Cart.css";

function CheckoutCard({ price, PaymentFunction }) {
  return (
    <div className={"checkoutCard"}>
      <h1 className={"totalPrice"}>{`${price},00 kr`}</h1>
      <button className={"paymentButton"} onClick={PaymentFunction}>
        CLICK-AND-COLLECT
      </button>
    </div>
  );
}

export default CheckoutCard;
