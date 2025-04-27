import express from "express";

const app = express();
app.get("/api/test", (req, res) => res.json({ ok: true }));

app.listen(3001);

export default app;
