// ==============================================
// 💚 Azahrabot Alive Command (v4.2.3)
// Status + Uptime + Memory + CPU + Owner info
// ==============================================

const os = require("os");
const settings = require("../settings");

module.exports = async (sock, msg, from) => {
  try {
    // 💚 React instantly
    await sock.sendMessage(from, { react: { text: "💚", key: msg.key } }).catch(() => {});
  } catch {}

  try {
    // 🧠 Bot & system info
    const botName = settings.botName || "Azahra Bot";
    const ownerName = settings.botOwner || "Azar";
    const prefix = settings.prefix || ".";
    const version = settings.version || "4.2.3";
    const author = settings.author || "AzarTech";
    const channel = settings.channelLink || "https://whatsapp.com/channel/0029VbBF0t8J93wQxPYwla2v";

    // 🕒 System stats
    const uptimeSec = process.uptime();
    const uptimeMin = Math.floor(uptimeSec / 60);
    const uptime = uptimeMin > 0 ? `${uptimeMin}m ${Math.floor(uptimeSec % 60)}s` : `${Math.floor(uptimeSec)}s`;
    const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const cpuModel = os.cpus()[0].model.split(" ").slice(0, 2).join(" ");
    const platform = os.platform();

    // 🖼️ Alive banner thumbnail
    const bannerUrl = "https://res.cloudinary.com/ds1lpf36n/image/upload/v1762079835/satoru-gojo-black-3840x2160-14684_1_amj5ys.png";

    // 💬 Status message
    const text = `
╭━━━〔 *💚 ${botName.toUpperCase()} STATUS* 〕━━━╮
│ 📅 *Date:* ${new Date().toLocaleDateString()}
│ ⏰ *Time:* ${new Date().toLocaleTimeString()}
│ 🕒 *Uptime:* ${uptime}
│ 💾 *Memory:* ${usedMem} MB
│ ⚙️ *Platform:* ${platform}
│ 💻 *CPU:* ${cpuModel}
│────────────────────
│ 👑 *Owner:* ${ownerName}
│ 🪄 *Prefix:* ${prefix}
│ 💫 *Version:* ${version}
╰━━━━━━━━━━━━━━━━━━━━━━╯
✅ *${botName} is alive and operational!*
────────────────────
⚙️ Type *${prefix}menu* to explore commands.
> powered by *${author}* ⚡
`.trim();

    // 💬 Send alive message with channel preview
    await sock.sendMessage(
      from,
      {
        text,
        contextInfo: {
          externalAdReply: {
            title: `${botName} is Online 💚`,
            body: "Operational and ready for commands!",
            mediaType: 1,
            renderLargerThumbnail: true,
            thumbnailUrl: bannerUrl,
            sourceUrl: channel,
          },
        },
      },
      { quoted: msg }
    );
  } catch (err) {
    console.error("❌ Alive command error:", err);
    await sock.sendMessage(from, { text: "⚠️ Failed to check bot status." }, { quoted: msg });
  }
};
