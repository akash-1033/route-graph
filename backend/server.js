const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const pathRoutes = require("./routes/path.routes");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", pathRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
