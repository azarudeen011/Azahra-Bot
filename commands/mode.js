// ==============================================
// ⚙️ Azahrabot Mode Command (v4.2.3 Optimized)
// Toggle between PUBLIC / PRIVATE command mode
// ==============================================

const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "../data/botMode.json");

// 🗂 Ensure /data directory exists
if (!fs.existsSync(path.join(__dirname, "../data"))) {
  fs.mkdirSync(path.join(__dirname, "../data"), { recursive: true });
}

// 🧠 Load or initialize mode file
function getMode() {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile));
    return data.mode || "public";
  } catch {
    return "public";
  }
}

function setMode(mode) {
  fs.writeFileSync(dataFile, JSON.stringify({ mode }, null, 2));
}

module.exports = async (sock, msg, from, text, args) => {
  const settings = require("../settings");

  const sender =
    msg.key.participant || msg.key.remoteJid || msg.participant || "unknown";
  const ownerNumber = (settings.ownerNumber || "").replace(/[^0-9]/g, "");
  const isOwner = msg.key.fromMe || (sender.includes(ownerNumber));

  const currentMode = getMode();
  const newMode = args[0]?.toLowerCase();

  try {
    // React ⚙️ when command is received
    await sock.sendMessage(from, { react: { text: "⚙️", key: msg.key } }).catch(() => {});
  } catch {}

  // 🧾 If no argument — show current mode
  if (!newMode) {
    const caption = `
⚙️ *Azahrabot Mode Status*
━━━━━━━━━━━━━━━━━━━
📢 *Current Mode:* ${currentMode.toUpperCase()}

🪄 *Available Options:*
• public → everyone can use commands
• private → only owner can use commands

💡 Example:
.mode public
.mode private
━━━━━━━━━━━━━━━━━━━
> powered by *AzarTech ⚡*
    `.trim();

    await sock.sendMessage(from, { text: caption }, { quoted: msg });
    return;
  }

  // 🛑 Only owner can modify mode
  if (!isOwner) {
    await sock.sendMessage(from, { text: "❌ Only the bot owner can change mode." }, { quoted: msg });
    return;
  }

  // 🔍 Validate mode type
  if (!["public", "private"].includes(newMode)) {
    await sock.sendMessage(from, {
      text: "⚙️ Invalid mode.\nUse `.mode public` or `.mode private`",
    }, { quoted: msg });
    return;
  }

  // 💾 Save mode and confirm change
  setMode(newMode);

  const confirm = `
✅ *Bot mode updated successfully!*
━━━━━━━━━━━━━━━━━━━
🆕 *New Mode:* ${newMode.toUpperCase()}
━━━━━━━━━━━━━━━━━━━
> *Azahrabot* is now operating in ${newMode} mode.
  `.trim();

  await sock.sendMessage(from, { text: confirm }, { quoted: msg });
};
