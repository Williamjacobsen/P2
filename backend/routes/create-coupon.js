const express = require('express');
const router = express.Router();

const db = require('../db.js');

router.post('/', (req, res) => {
  const { coupon_code, discount_value, is_percentage, is_active } = req.body;

  const sql = `INSERT INTO Coupons (coupon_code, discount_value, is_percentage, is_active) VALUES (?, ?, ?, ?)`;

  db.execute(sql, [coupon_code, discount_value, is_percentage, is_active], (err, results) => {
    if (err) {
      console.error('Error inserting coupon:', err);
      return res.status(500).send('Failed to save coupon');
    }
    res.send('Coupon saved successfully');
  });
});

export default router;