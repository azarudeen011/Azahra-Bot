// ==============================================
// ⚙️ Azahrabot Mode Command (v5.0 Secure Access Edition)
// Strict Access Control • Multi-Owner Safe • Group Privacy
// ==============================================

const fs = require("fs");
const path = require("path");
const settings = require("../settings");
const secure = require("../lib/small_lib"); // branding info

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

// 💾 Save mode safely
function setMode(mode) {
  fs.writeFileSync(dataFile, JSON.stringify({ mode }, null, 2));
}

module.exports = async (sock, msg, from, text, args) => {
  const sender =
    msg.key.participant || msg.key.remoteJid || msg.participant || "unknown";

  const ownerNumber = (settings.ownerNumber || "").replace(/[^0-9]/g, "");
  const isOwner = msg.key.fromMe || sender.includes(ownerNumber);
  const isGroup = from.endsWith("@g.us");

  const mode = getMode();
  const newMode = args[0]?.toLowerCase();

  // React ⚙️ when command is received
  try {
    await sock.sendMessage(from, { react: { text: "⚙️", key: msg.key } }).catch(() => {});
  } catch {}

  // 🚫 Access Control (Global Rule)
  // If bot in PRIVATE mode:
  if (mode === "private") {
    if (isGroup) return; // ❌ ignore all group messages
    if (!isOwner && !text.startsWith(".mode")) return; // ❌ ignore DMs from non-owner users
  }

  // 🔧 MODE COMMAND — only owner can use
  if (!isOwner && text.startsWith(".mode")) {
    await sock.sendMessage(
      from,
      { text: "❌ Only the bot owner can access this command." },
      { quoted: msg }
    );
    return;
  }

  // 🧾 Show current mode (no args)
  if (!newMode) {
    // Only owner can *see* mode status
    if (!isOwner) return;

    const caption = `
⚙️ *${secure.botName} Mode Status*
━━━━━━━━━━━━━━━━━━━
📢 *Current Mode:* ${mode.toUpperCase()}

🪄 *Options:*
• public → everyone can use commands
• private → only owner (in DM)
━━━━━━━━━━━━━━━━━━━
💡 Example:
.mode public
.mode private
━━━━━━━━━━━━━━━━━━━
> powered by *${secure.author} ⚡*
    `.trim();

    await sock.sendMessage(from, { text: caption }, { quoted: msg });
    return;
  }

  // 🛑 Validate mode type
  if (!["public", "private"].includes(newMode)) {
    await sock.sendMessage(
      from,
      { text: "⚙️ Invalid mode.\nUse `.mode public` or `.mode private`" },
      { quoted: msg }
    );
    return;
  }

  // 💾 Save mode & confirm
  setMode(newMode);

  const confirm = `
✅ *${secure.botName} Mode Updated Successfully!*
━━━━━━━━━━━━━━━━━━━
🆕 *Now Operating In:* ${newMode.toUpperCase()}
━━━━━━━━━━━━━━━━━━━
> ${secure.botName} is now in *${newMode}* mode.
  `.trim();

  await sock.sendMessage(from, { text: confirm }, { quoted: msg });
};
