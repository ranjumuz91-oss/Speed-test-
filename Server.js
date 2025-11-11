// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.raw({ type: "*/*", limit: "500mb" }));

// Serve index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Download endpoint
app.get("/download", (req, res) => {
  const size = Math.max(1, parseInt(req.query.size || "5000000", 10)); // default 5MB
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", "attachment; filename=\"speedtest.bin\"");
  const chunkSize = 64 * 1024;
  let sent = 0;
  function sendChunk() {
    if (sent >= size) return res.end();
    const remaining = Math.min(chunkSize, size - sent);
    const buf = crypto.randomBytes(remaining);
    sent += remaining;
    const ok = res.write(buf);
    if (!ok) res.once("drain", sendChunk);
    else setImmediate(sendChunk);
  }
  sendChunk();
});

// Upload endpoint
app.post("/upload", (req, res) => {
  const bytes = req.body ? req.body.length : 0;
  res.json({ received: bytes });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Speed Test Server running on http://localhost:${PORT}`));
