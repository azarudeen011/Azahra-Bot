// =============================================
// 🧹 Azahrabot Stability Manager (main.js)
// Handles safe temp folder + background cleaner
// =============================================
//
// WHY:
//   Some free hosting panels (Replit, Render, Railway, etc.) and small VPS systems
//   have *very limited /tmp storage space*.
//   When your bot downloads, converts, or processes media files (like stickers,
//   songs, videos, etc.), Node.js writes those temporary files into /tmp.
//
//   If /tmp fills up, Node will crash with this error:
//       ❌ Error: ENOSPC: no space left on device
//
// WHAT THIS DOES:
//   1. Redirects all temporary file operations from the system `/tmp`
//      to your project’s own folder: `./temp/`
//   2. Automatically cleans that folder every few hours
//      so it never overflows.
//
// BENEFITS:
//   ✅ Prevents “No space left on device” crashes
//   ✅ Keeps your hosting environment stable
//   ✅ Self-cleans — no manual deleting required
//   ✅ Works on Replit, VPS, Railway, Render, Termux, etc.
//

const fs = require("fs");
const path = require("path");

// =============================================
// 🧠 STEP 1: Create custom temp directory
// =============================================
const customTemp = path.join(process.cwd(), "temp");

// If it doesn't exist, make it
if (!fs.existsSync(customTemp)) {
  fs.mkdirSync(customTemp, { recursive: true });
  console.log("📁 Created /temp directory for safer storage");
}

// Redirect all Node.js temp operations to this folder
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

console.log("✅ Azahrabot Temp Fix Loaded — Safe temp folder active at:", customTemp);

// =============================================
// 🧹 STEP 2: Auto-clean temp folder every 3 hours
// =============================================
setInterval(() => {
  fs.readdir(customTemp, (err, files) => {
    if (err) return;
    for (const file of files) {
      const filePath = path.join(customTemp, file);
      fs.stat(filePath, (err, stats) => {
        if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
          fs.unlink(filePath, () => {});
        }
      });
    }
  });
  console.log("🧹 Temp folder auto-cleaned (3-hour interval)");
}, 3 * 60 * 60 * 1000);

// =============================================
// 🔁 STEP 3: Import background cleaner (extra safety)
// =============================================
try {
  require("./lib/tempCleaner");
  console.log("🧠 Background cleaner active (hourly checks)");
} catch (err) {
  console.warn("⚠️ tempCleaner not found or failed to load:", err.message);
}

// =============================================
// ✅ END OF MAIN.JS
// Automatically runs with require('./main.js')
// from your index.js
// =============================================
