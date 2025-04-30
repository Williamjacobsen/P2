import { useState } from 'react';

export default function CreateCoupon() {
  const [form, setForm] = useState({
    CouponCode: '',
    DiscountValue: '',
    IsActive: true
  });

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
      console.log("djaflkjfds");
      // Extract data from form
      const CouponCode = form.CouponCode;
      const DiscountValue = form.DiscountValue;
      const IsActive = form.IsActive;
      console.log("djaflddkjfds");
      // Post data from the form to server
      const response = await fetch("http://localhost:3001/create-coupon", {
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
      console.log("djaflddkjfds");
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

  return (
    <form onSubmit={handleSubmit}>
      <input name="CouponCode" placeholder="Coupon Code" onChange={handleChange} required />
      <input name="DiscountValue" type="number" step="0.01" placeholder="Discount Value" onChange={handleChange} required />
      <label>
        <input type="checkbox" name="IsActive" checked={form.IsActive} onChange={handleChange} />
        Active
      </label>
      <button type="submit">Create Coupon</button>
    </form>
  );
}