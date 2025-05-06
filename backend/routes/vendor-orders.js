import express from "express";
import pool from "../db.js";

const router = express.Router();

import { validationResult } from "express-validator";
import {
  handleValidationErrors,
  validateProfileAccessToken,
} from "../utils/inputValidation.js";
import { getProfile } from "./profile.js";

router.get("/:vendorID", validateProfileAccessToken, async (req, res) => {
  try {
    handleValidationErrors(req, res, validationResult);
    const accessToken = req.cookies.profileAccessToken;
    const profile = await getProfile(res, accessToken);

    if (!profile.VendorID) {
      throw new Error("User is not a Vendor");
    }

    const vendorID = req.params.vendorID;

    const [vendorCVR] = await pool.query(
      "SELECT CVR FROM Vendor WHERE ID = ?",
      [vendorID]
    );

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
  } catch (error) {
    console.error("Error getting vendor order:", error);
    if (res._header === null) {
      res.status(500).json({ message: "Error getting vendor order" });
    }
  }
});

router.post(
  "/update/:orderID",
  validateProfileAccessToken,
  async (req, res) => {
    try {
      handleValidationErrors(req, res, validationResult);
      const accessToken = req.cookies.profileAccessToken;
      const profile = await getProfile(res, accessToken);

      if (!profile.VendorID) {
        throw new Error("User is not a Vendor");
      }

      await pool.query(
        `UPDATE ProductOrder SET IsCollected = ?, IsReady = ? WHERE ID = ?`,
        [req.body.IsCollected, req.body.IsReady, req.params.orderID]
      );

      res.sendStatus(200);
    } catch (error) {
      console.error("Error updating vendor order:", error);
      if (res._header === null) {
        res.status(500).json({ message: "Error updating vendor order" });
      }
    }
  }
);

export default router;
