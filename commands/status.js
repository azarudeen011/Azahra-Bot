// ==========================================================
// 💻 Azahrabot System Status v4.8
// Uptime • Memory • CPU • Live Mode • Banner
// ==========================================================

const os = require("os");
const fs = require("fs");
const path = require("path");
const process = require("process");
const { runtime } = require("../lib/functions");
const settings = require("../settings");

module.exports = async (sock, msg, from, text, args) => {
  try {
    // 🧠 System Info
    const used = process.memoryUsage();
    const totalRAM = os.totalmem();
    const freeRAM = os.freemem();
    const cpuLoad = os.loadavg()[0].toFixed(2);
    const uptime = runtime(process.uptime());

    // 💾 Format numbers
    const usedMB = (used.rss / 1024 / 1024).toFixed(2);
    const freeMB = (freeRAM / 1024 / 1024).toFixed(2);
    const totalMB = (totalRAM / 1024 / 1024).toFixed(2);
    const usagePercent = ((used.rss / totalRAM) * 100).toFixed(2);

    // ✅ Load live mode from /data/botMode.json
    const modeFile = path.join(__dirname, "../data/botMode.json");
    let currentMode = "public";
    try {
      if (fs.existsSync(modeFile)) {
        const data = JSON.parse(fs.readFileSync(modeFile, "utf8"));
        currentMode = data.mode || "public";
      }
    } catch (err) {
      console.log("⚠️ Mode read error:", err.message);
    }

    // 🧾 Message body
    const info = `
⚙️ *${settings.botName} — System Status*
━━━━━━━━━━━━━━━━━━━
🕒 *Uptime:* ${uptime}
💾 *Memory:* ${usedMB} / ${totalMB} MB (${usagePercent}%)
🔋 *Free RAM:* ${freeMB} MB
🧠 *CPU Load:* ${cpuLoad}
📦 *Version:* ${settings.version}
👑 *Owner:* ${settings.botOwner}
━━━━━━━━━━━━━━━━━━━
📍 *Mode:* ${currentMode.toUpperCase()}
🌐 *Update:* ${settings.updateZipUrl ? "Available ✅" : "Disabled ❌"}
━━━━━━━━━━━━━━━━━━━
💬 *Status:* Running Smooth ⚡
> powered by 𝘼𝙯𝙖𝙧𝙏𝙚𝙘𝙝 🚀
    `.trim();

    // 🪄 Send fancy banner message
    await sock.sendMessage(
      from,
      {
        text: info,
        contextInfo: {
          externalAdReply: {
            title: `${settings.botName} — System Monitor 💫`,
            body: "Uptime, memory, and version in real time.",
            mediaType: 1,
            renderLargerThumbnail: true,
            thumbnailUrl:
              "https://res.cloudinary.com/ds1lpf36n/image/upload/v1762079835/satoru-gojo-black-3840x2160-14684_1_amj5ys.png",
            sourceUrl: "https://github.com/azarudeen011/Azahra-Bot",
          },
        },
      },
      { quoted: msg }
    );
  } catch (err) {
    console.error("❌ Error in status command:", err);
    await sock.sendMessage(
      from,
      { text: "⚠️ Failed to get system status." },
      { quoted: msg }
    );
  }
};
