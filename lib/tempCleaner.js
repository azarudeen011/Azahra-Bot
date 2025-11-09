// lib/tempCleaner.js
// 🧹 Cleans old temp files every hour (prevents disk overflow)
// Azahrabot v4.9 Stable Optimization

const fs = require("fs");
const path = require("path");

function cleanupTempFiles() {
  const tempDir = path.join(process.cwd(), "temp");

  // ✅ Ensure temp folder exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log("📁 Created missing /temp directory");
    return;
  }

  const files = fs.readdirSync(tempDir);
  const now = Date.now();
  const maxAge = 3 * 60 * 60 * 1000; // 3 hours

  let cleaned = 0;
  for (const file of files) {
    const filePath = path.join(tempDir, file);
    try {
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    } catch (err) {
      console.error(`⚠️ Failed to delete temp file ${file}:`, err.message);
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} temp files — ${new Date().toLocaleString()}`);
  }
}

// 🕒 Run once on startup + hourly
cleanupTempFiles();
setInterval(cleanupTempFiles, 60 * 60 * 1000);

module.exports = { cleanupTempFiles };
