import app from "./app.js";

const port = 3001;

// Start server
app.listen(port, () => {
  console.log(`Server running...`);
});

export default app;
