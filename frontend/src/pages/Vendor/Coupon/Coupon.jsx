import { useState } from 'react';
import { Navigate } from "react-router-dom";

import useGetProfile from "../../Profile/useGetProfile";
import useGetVendor from "../../Profile/useGetVendor";

export default function CreateCoupon() {

  // Hooks
  const [isLoadingProfile, profile] = useGetProfile();
  const [isLoadingVendor, vendor] = useGetVendor(profile?.VendorID);

  const [form, setForm] = useState({
    CouponCode: '',
    DiscountValue: '',
    IsActive: true
  });

  const [couponToDelete, setCouponToDelete] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Extract data from form
      const CouponCode = form.CouponCode;
      const DiscountValue = form.DiscountValue;
      const IsActive = form.IsActive;
      // Post data from the form to server
      const response = await fetch("http://localhost:3001/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CouponCode,
          DiscountValue,
          IsActive
        }),
      });
      // Handle server response
      const data = await response.json(); // In case you need to get read a response from the server
      if (!response.ok) {
        return Promise.reject(data.error);
      }
      alert('Coupon created successfully!');
    }
    catch (error) {
      console.log(error);
      alert('Error creating coupon. Error: ' + error);
    }
  };

const handleDelete = async (e) => {
  e.preventDefault();
  if (!couponToDelete) {
    alert('Please enter a coupon code');
    return;
  }
  
  try {
    const response = await fetch("http://localhost:3001/coupons", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        CouponCode: couponToDelete
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete coupon');
    }
    
    alert('Coupon deleted successfully!');
    setCouponToDelete(''); // Clear input after deletion
  } catch (error) {
    console.error('Error:', error);
    alert(`Error deleting coupon: ${error.message}`);
  }
}


  // Is the user signed in?
  if (isLoadingProfile) {
    return (<>Loading login...</>);
  }
  else if (profile === undefined) {
    return (<Navigate to="/sign-in" replace />);
  }

  // Is the user a vendor?
  if (isLoadingVendor) {
    return (<>Loading vendor information...</>);
  }
  else if (vendor === null) {
    return (<>You are not a vendor, so you do not have access to this page.</>);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="CouponCode" placeholder="Coupon Code" onChange={handleChange} required />
        <input name="DiscountValue" type="number" step="0.01" placeholder="Discount Value" onChange={handleChange} required />
        <label>
          <input type="checkbox" name="IsActive" checked={form.IsActive} onChange={handleChange} />
          Active
        </label>
        <button type="submit">Create Coupon</button>
      </form>
      
      <form onSubmit={handleDelete}>
        <input 
          value={couponToDelete} 
          onChange={(e) => setCouponToDelete(e.target.value)} 
          placeholder="Enter Coupon to Delete" 
          required
        />
        <button type="submit">Delete Coupon</button>
      </form>
    </div>
  );
}