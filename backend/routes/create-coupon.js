import express from 'express';
import pool from "../db.js";

const router = express.Router();

router.post('/', async (req, res) => {
  try {

    const {
      CouponCode,
      DiscountValue,
      IsActive
    } = req.body;

    await pool.query(`INSERT INTO p2.Coupons 
      (CouponCode, DiscountValue, IsActive)
      VALUES (?, ?, ?)`,
      [
        CouponCode,
        DiscountValue,
        IsActive
      ]
    );

    res.status(200).json({}); // 200 = OK
  }
  catch (error) {
    console.error('Error inserting coupon:', error);
    return res.status(500).json({ error: error }); // 500 = Internal server error
  }
});

router.delete ('/', async (req, res) => {
  try {
      const { 
        CouponCode 
      } = req.body;

      // First check if coupon exists
      const [existing] = await pool.query(
          'SELECT * FROM p2.Coupons WHERE CouponCode = ?',
          [
            CouponCode
          ]
      );

      if (existing.length === 0) {
          return res.status(404).json({ error: 'Coupon not found' });
      }

      // Delete the coupon
      await pool.query(
          'DELETE FROM p2.Coupons WHERE CouponCode = ?',
          [
            CouponCode
          ]
      );

      res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { couponCode } = req.body;
    
    // Validate input
    if (!couponCode) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    // Database query - IMPORTANT: Use your exact column names
    const [rows] = await pool.query(
      'SELECT CouponCode, DiscountValue FROM p2.Coupons WHERE CouponCode = ? AND IsActive = 1',
      [couponCode]
    );

    // Check if coupon exists
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Return the first matching coupon
    res.json({
      CouponCode: rows[0].CouponCode,
      DiscountValue: rows[0].DiscountValue
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;