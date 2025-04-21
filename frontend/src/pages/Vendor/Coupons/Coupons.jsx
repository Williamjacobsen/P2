import { useState } from 'react';

export default function CreateCoupon() {
  const [form, setForm] = useState({
    coupon_code: '',
    discount_value: '',
    is_percentage: false,
    is_active: true
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
      // Extract data from form
      const coupon_code = form.coupon_code;
      const discount_value = form.discount_value;
      const is_percentage = form.is_percentage;
      const is_active = form.is_active;
      // Post data from the form to server
      const response = await fetch("http://localhost:3001/profile/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coupon_code,
          discount_value,
          is_percentage,
          is_active
        }),
      });
      // Handle server response
      const data = await response.json(); // In case you need to get read a response from the server
      if (!response.ok) return Promise.reject("Oh nooooo! There was an error!");
      alert('Coupon created successfully!');
    }
    catch (error) {
      console.error(error);
      alert('Error creating coupon.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="coupon_code" placeholder="Coupon Code" onChange={handleChange} required />
      <input name="discount_value" type="number" step="0.01" placeholder="Discount Value" onChange={handleChange} required />
      <label>
        <input type="checkbox" name="is_percentage" onChange={handleChange} />
        Percentage?
      </label>
      <label>
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
        Active
      </label>
      <button type="submit">Create Coupon</button>
    </form>
  );
}