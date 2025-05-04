import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET all FAQs or FAQs for a specific vendor
router.get("/", async (req, res) => {
  const vendorId = req.query.vendor_id;
  try {
    if (vendorId) {
      const [result] = await pool.query(
        "SELECT * FROM FAQ WHERE VendorID = ?;",
        [vendorId]
      );
      res.status(200).json(result);
    } else {
      const [result] = await pool.query("SELECT * FROM FAQ;");
      res.status(200).json(result);
    }
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// POST a new FAQ
router.post("/", async (req, res) => {
  const { vendor_id, question, answer } = req.body;

  if (!vendor_id || !question || !answer) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO FAQ (VendorID, Question, Answer) VALUES (?, ?, ?);",
      [vendor_id, question, answer]
    );
    res
      .status(201)
      .json({ message: "FAQ added successfully", id: result.insertId });
  } catch (error) {
    console.error("Error adding FAQ:", error);
    res.status(500).json({ error: "Failed to add FAQ" });
  }
});

// PUT (edit) an existing FAQ
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  try {
    await pool.query("UPDATE FAQ SET Question = ?, Answer = ? WHERE ID = ?;", [
      question,
      answer,
      id,
    ]);
    res.status(200).json({ message: "FAQ updated successfully" });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

// DELETE an FAQ
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM FAQ WHERE ID = ?;", [id]);
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

export default router;
