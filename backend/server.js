const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const pathRoutes = require("./routes/path.routes");
const { loadGraphIntoMemory } = require("./services/graph.service");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", pathRoutes);

const start = async () => {
  try {
    await loadGraphIntoMemory(1);
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

start();
