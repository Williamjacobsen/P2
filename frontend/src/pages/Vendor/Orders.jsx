import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import useGetProfile from "../Profile/useGetProfile";
import useGetVendor from "../Profile/useGetVendor";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const [storeID, setStoreID] = useState(-1);
  const [isLoadingProfile, profile] = useGetProfile();
  const [isLoadingVendor, vendor] = useGetVendor(profile?.VendorID);

  useEffect(() => {
    (async () => {
      setStoreID(profile?.VendorID);
    })();
  }, [profile]);

  useEffect(() => {
    async function getOrders() {
      if (isLoadingVendor) {
        return <>Loading vendor information...</>;
      } else if (vendor === null) {
        return (
          <>You are not a vendor, so you do not have access to this page.</>
        );
      }
      try {
        const ordersReq = await fetch(
          `http://localhost:3001/vendor-orders/${storeID}`,
          { credentials: "include" }
        );
        if (!ordersReq.ok) throw new Error("Update failed");

        const ordersData = await ordersReq.json();
        setOrders(ordersData);
      } catch (err) {
        console.error(err);
      }
    }
    getOrders();
  }, [isLoadingVendor, vendor, storeID]);

  function handleCheckboxChange(orderID, field, value) {
    setOrders((orders) =>
      orders.map((order) => {
        if (order.ID !== orderID) return order;

        if (field === "IsCollected" && value === true && !order.IsReady) {
          alert("Cannot mark as collected before it is marked as ready.");
          return order;
        }

        return { ...order, [field]: value };
      })
    );
  }

  // Is the user signed in?
  if (isLoadingProfile) {
    return <>Loading login...</>;
  } else if (profile === undefined) {
    return <Navigate to="/sign-in" replace />;
  }

  // Is the user a vendor?
  if (isLoadingVendor) {
    return <>Loading vendor information...</>;
  } else if (vendor === null) {
    return <>You are not a vendor, so you do not have access to this page.</>;
  }

  async function handleUpdate(orderID) {
    const orderToUpdate = orders.find((order) => order.ID === orderID);
    if (!orderToUpdate) return;

    try {
      const res = await fetch(
        `http://localhost:3001/vendor-orders/update/${orderID}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            IsCollected: orderToUpdate.IsCollected,
            IsReady: orderToUpdate.IsReady,
          }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      alert("Order updated successfully");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      {orders.map((order, i) => (
        <div key={i} style={{ backgroundColor: "rgb(200, 200, 200)" }}>
          <h4>Customer:</h4>
          <h4>
            Email: {order.customerEmail} - Phone Number: {order.customerPhone}
          </h4>
          <h4>Product:</h4>
          <h4>
            Product Name: {order.ProductName} - Brand: {order.ProductBrand} -
            Clothing Type: {order.ProductClothingType} - Gender:{" "}
            {order.ProductGender} - ProductSize: {order.ProductSize} - Quantity:{" "}
            {order.Quantity} - Price: {order.ProductPrice}
          </h4>
          <h4>Other:</h4>
          <h4>Date Time of Purchase: {order.DateTimeOfPurchase}</h4>
          <h4>
            Is Product Ready for Customer
            <input
              type="checkbox"
              checked={order.IsReady}
              onChange={(e) =>
                handleCheckboxChange(order.ID, "IsReady", e.target.checked)
              }
            />
          </h4>
          <h4>
            Has Customer Picked up the Product
            <input
              type="checkbox"
              checked={order.IsCollected}
              onChange={(e) =>
                handleCheckboxChange(order.ID, "IsCollected", e.target.checked)
              }
            />
          </h4>
          <button
            onClick={() => handleUpdate(order.ID)}
            style={{
              fontSize: "17px",
              position: "relative",
              left: "5%",
            }}
          >
            Update
          </button>
        </div>
      ))}
    </div>
  );
}
