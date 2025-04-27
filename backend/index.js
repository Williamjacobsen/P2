import express from "express";
import pool from "./db.js";

const app = express();
app.get("/api/test", (req, res) => res.json({ ok: true }));

app.listen(3001);

export default app;
