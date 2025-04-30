import React from "react";
import { useNavigate } from "react-router-dom";



export default function Failure() {
  const navigate = useNavigate();

  return (
    <div>
        <h1>Purchase was canceled</h1>
        <button onClick={() => navigate("/Cart")}>Back to Cart</button>
        <br></br>
        <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}