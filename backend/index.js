import express from "express";
import serverless from "serverless-http";

const app = express();
app.get("/api/test", (req, res) => res.json({ ok: true }));

export default serverless(app);
