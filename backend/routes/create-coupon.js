import express from 'express';
import pool from "../db.js";

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log("hddddeydddyy");
    const {
      CouponCode,
      DiscountValue,
      IsActive
    } = req.body;

    console.log("heydddyy");
    await pool.query(`INSERT INTO p2.Coupons 
      (CouponCode, DiscountValue, IsActive)
      VALUES (?, ?, ?)`,
      [
        CouponCode,
        DiscountValue,
        IsActive
      ]
    );

    console.log("heyyy");
    res.status(200).json({}); // 200 = OK
  }
  catch (error) {
    console.error('Error inserting coupon:', error);
    return res.status(500).json({ error: error }); // 500 = Internal server error
  }
});

export default router;