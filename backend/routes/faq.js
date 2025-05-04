import express from "express";
import pool from "../db.js";

const router = express.Router();
console.log("faq: 1 - Express router created");

// GET all FAQs or FAQs for a specific vendor
router.get("/", async (req, res) => {
  const vendorId = req.query.vendor_id;
  console.log("faq: GET / - vendor_id query param:", vendorId);

  try {
    if (vendorId) {
      console.log("faq: Fetching FAQs for vendor:", vendorId);
      const [result] = await pool.query(
        "SELECT * FROM FAQ WHERE VendorID = ?;",
        [vendorId]
      );
      console.log("faq: Retrieved FAQs for vendor:", result.length);
      res.status(200).json(result);
    } else {
      console.log("faq: Fetching all FAQs");
      const [result] = await pool.query("SELECT * FROM FAQ;");
      console.log("faq: Retrieved all FAQs:", result.length);
      res.status(200).json(result);
    }
  } catch (error) {
    console.error("faq: Error fetching FAQs:", error);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// POST a new FAQ
router.post("/", async (req, res) => {
  const { vendor_id, question, answer } = req.body;
  console.log("faq: POST / - Request body:", req.body);

  if (!vendor_id || !question || !answer) {
    console.log("faq: Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log("faq: Inserting new FAQ");
    const [result] = await pool.query(
      "INSERT INTO FAQ (VendorID, Question, Answer) VALUES (?, ?, ?);",
      [vendor_id, question, answer]
    );
    console.log("faq: FAQ inserted with ID:", result.insertId);
    res
      .status(201)
      .json({ message: "FAQ added successfully", id: result.insertId });
  } catch (error) {
    console.error("faq: Error adding FAQ:", error);
    res.status(500).json({ error: "Failed to add FAQ" });
  }
});

// PUT (edit) an existing FAQ
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  console.log("faq: PUT /:id - ID:", id, "Updated data:", { question, answer });

  try {
    await pool.query("UPDATE FAQ SET Question = ?, Answer = ? WHERE ID = ?;", [
      question,
      answer,
      id,
    ]);
    console.log("faq: FAQ updated for ID:", id);
    res.status(200).json({ message: "FAQ updated successfully" });
  } catch (error) {
    console.error("faq: Error updating FAQ:", error);
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

// DELETE an FAQ
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("faq: DELETE /:id - ID:", id);

  try {
    await pool.query("DELETE FROM FAQ WHERE ID = ?;", [id]);
    console.log("faq: FAQ deleted for ID:", id);
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("faq: Error deleting FAQ:", error);
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

console.log("faq: 2 - All routes configured");

export default router;
