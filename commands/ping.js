// ==============================================
// ⚡ Azahrabot Ping Command (v4.2.1 Optimized)
// Measures bot speed, uptime, and system load
// ==============================================

const os = require("os");
const settings = require("../settings");
const { runtime } = require("../lib/functions");

module.exports = async (sock, msg, from) => {
  try {
    // ⚡ React instantly to confirm command
    await sock.sendMessage(from, { react: { text: "⚡", key: msg.key } }).catch(() => {});
  } catch {}

  try {
    // ⏱ Measure actual latency
    const start = Date.now();
    await sock.sendMessage(from, { text: "🏓 *pong* 🏓" });
    const ping = (Date.now() - start).toFixed(2);

    // 🧠 System info
    const uptime = runtime(process.uptime());
    const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const platform = os.platform();
    const cpu = os.cpus()[0].model.split(" ")[0];
    const botName = settings.botName || "Azahra Bot";
    const author = settings.author || "AzarTech";
    const version = settings.version || "4.2.1";

    // 🎯 Response message
    const result = `
╭━━━〔 *⚡ ${botName.toUpperCase()} STATUS* 〕━━━╮
│ 🕒 *Ping:* ${ping} ms
│ 🧭 *Uptime:* ${uptime}
│ 💾 *Memory:* ${usedMem} MB
│ ⚙️ *CPU:* ${cpu}
│ 💻 *Platform:* ${platform}
│ 📦 *Version:* ${version}
╰━━━━━━━━━━━━━━━━━━━━━━╯
✅ *Bot is Online and Responding Smoothly!*
──────────────────────
> *powered by ${author} ⚡*
    `.trim();

    await sock.sendMessage(from, { text: result }, { quoted: msg });
  } catch (err) {
    console.error("❌ Ping command error:", err.message);
    await sock.sendMessage(from, { text: "⚠️ Ping test failed. Try again." }, { quoted: msg });
  }
};
