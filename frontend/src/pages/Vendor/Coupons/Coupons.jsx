import { useState } from 'react';
import axios from 'axios';

function CreateCoupon() {
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
      await axios.post('/api/coupons', form); // no token needed
      alert('Coupon created successfully!');
    } catch (error) {
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

export default CreateCoupon;