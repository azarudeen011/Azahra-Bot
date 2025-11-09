// ==============================================
// ⚙️ Azahrabot Menu Command (v4.2.3 - Live Mode Sync + No Channel Preview)
// ==============================================

const fs = require("fs");
const path = require("path");
const { banner, menuText } = require("../utils/menuData");

module.exports = async (sock, msg, from) => {
  try {
    // React to show menu is being processed
    await sock.sendMessage(from, { react: { text: "📜", key: msg.key } });
  } catch (err) {
    console.log("Reaction failed:", err.message);
  }

  // ✅ Ensure /data folder exists
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // ✅ Get bot mode (live check)
  const modeFile = path.join(dataDir, "botMode.json");
  let currentMode = "public"; // default

  try {
    if (fs.existsSync(modeFile)) {
      const modeData = JSON.parse(fs.readFileSync(modeFile, "utf8"));
      if (modeData && typeof modeData.mode === "string") {
        currentMode = modeData.mode.toLowerCase();
      }
    } else {
      fs.writeFileSync(modeFile, JSON.stringify({ mode: "public" }, null, 2));
    }
  } catch (err) {
    console.error("⚠️ Mode read error:", err.message);
  }

  // 🕒 Format date and time nicely
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  // 🧾 Build dynamic menu text
  const text = menuText(dateStr, timeStr, currentMode);

  try {
    // ✅ Send clean banner + caption (no channel preview)
    await sock.sendMessage(
      from,
      {
        image: { url: banner },
        caption: text.trim()
      },
      { quoted: msg }
    );
  } catch (err) {
    console.error("❌ Failed to send menu:", err.message);
    await sock.sendMessage(from, { text: "⚠️ Could not send menu." }, { quoted: msg });
  }
};
