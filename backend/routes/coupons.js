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

export default router;