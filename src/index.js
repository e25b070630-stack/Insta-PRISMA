// src/index.js
// Main entry point for the InstaLite backend.

require("dotenv").config();

const express = require("express");
const prisma = require("./db");

const usersRouter = require("./routes/users.routes");
const postsRouter = require("./routes/posts.routes");

const app = express();
const PORT = 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
