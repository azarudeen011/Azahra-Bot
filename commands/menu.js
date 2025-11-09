// ==============================================
// ⚙️ Azahrabot Menu Command (v5.0 Stable + Live Mode Sync)
// Dynamic Menu • No Channel Preview • Crash-Proof
// ==============================================

const fs = require("fs");
const path = require("path");
const { banner, menuText } = require("../utils/menuData");

module.exports = async (sock, msg, from) => {
  try {
    // React to indicate menu command received
    await sock.sendMessage(from, { react: { text: "📜", key: msg.key } }).catch(() => {});
  } catch {}

  // ✅ Ensure /data folder exists
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // ✅ Get bot mode safely
  const modeFile = path.join(dataDir, "botMode.json");
  let currentMode = "public";

  try {
    if (fs.existsSync(modeFile)) {
      const modeData = JSON.parse(fs.readFileSync(modeFile, "utf8"));
      if (modeData?.mode && typeof modeData.mode === "string") {
        currentMode = modeData.mode.toLowerCase();
      } else throw new Error("Invalid mode data");
    } else {
      fs.writeFileSync(modeFile, JSON.stringify({ mode: "public" }, null, 2));
    }
  } catch (err) {
    console.warn("⚠️ Mode file error:", err.message);
    currentMode = "public";
  }

  // 🕒 Generate formatted date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  // 🧾 Build dynamic menu text
  const text = menuText(dateStr, timeStr, currentMode);

  // ✅ Send clean single banner message (no “Photo” glitch)
  try {
    await sock.sendMessage(from, {
      image: { url: banner },
      caption: text.trim(),
      viewOnce: false, // make sure it’s not hidden
      jpegThumbnail: Buffer.alloc(0)
    }, { quoted: msg });
  } catch (err) {
    console.error("❌ Menu send failed:", err.message);
    await sock.sendMessage(from, { text: "⚠️ Could not send menu." }, { quoted: msg });
  }
};
