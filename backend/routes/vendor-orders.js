import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/:vendorID", async (req, res) => {
  const { vendorID } = req.params;

  const [vendorCVR] = await pool.query("SELECT CVR FROM Vendor WHERE ID = ?", [
    vendorID,
  ]);

  const [orders] = await pool.query(
    "SELECT * FROM ProductOrder WHERE VendorCVR = ?",
    [vendorCVR[0].CVR]
  );

  const [customerProfile] = await pool.query(
    "SELECT EMAIL, PhoneNumber FROM Profile WHERE ID = ?",
    [orders[0].CustomerProfileID]
  );

  const result = orders.map((order) => ({
    ...order,
    customerEmail: customerProfile[0].EMAIL,
    customerPhone: customerProfile[0].PhoneNumber,
  }));

  res.status(200).json(result);
});

router.post("/update/:orderID", async (req, res) => {
  await pool.query(
    `UPDATE ProductOrder SET IsCollected = ?, IsReady = ? WHERE ID = ?`,
    [req.body.IsCollected, req.body.IsReady, req.params.orderID]
  );

  res.sendStatus(200);
});

export default router;
