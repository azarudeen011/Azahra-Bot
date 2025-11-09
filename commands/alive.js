// ==============================================
// 💚 Azahrabot Alive Command (v5.0 Clean)
// Minimal Alive — Only essential info shown
// ==============================================

const os = require("os");
const small = require("../lib/small_lib");

module.exports = async (sock, msg, from) => {
  try {
    // 💚 React instantly when command runs
    await sock.sendMessage(from, { react: { text: "💚", key: msg.key } }).catch(() => {});
  } catch {}

  try {
    // 🧠 Core bot and system info
    const botName = small.botName;
    const ownerName = small.ownerName;
    const prefix = ".";
    const version = "5.0";
    const author = small.author;

    // 🕒 Uptime & resource stats
    const uptimeSec = process.uptime();
    const uptimeMin = Math.floor(uptimeSec / 60);
    const uptime = uptimeMin > 0 ? `${uptimeMin}m ${Math.floor(uptimeSec % 60)}s` : `${Math.floor(uptimeSec)}s`;
    const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const cpuModel = os.cpus()[0].model.split(" ").slice(0, 2).join(" ");
    const platform = os.platform();

    // 💬 Alive message (no banner)
    const text = `
💚 *${botName} System Alive*
━━━━━━━━━━━━━━━━━━━
🕒 *Uptime:* ${uptime}
💾 *Memory:* ${usedMem} MB
⚙️ *Platform:* ${platform}
💻 *CPU:* ${cpuModel}
━━━━━━━━━━━━━━━━━━━
👑 *Owner:* ${ownerName}
💫 *Version:* ${version}
────────────────────
✅ Bot is running perfectly fine!
> powered by *${author}* ⚡
`.trim();

    // ✅ Send clean plain text message
    await sock.sendMessage(from, { text }, { quoted: msg });

  } catch (err) {
    console.error("❌ Alive command error:", err.message);
    await sock.sendMessage(from, { text: "⚠️ Failed to check bot status." }, { quoted: msg });
  }
};
