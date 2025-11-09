// commands/repo.js
// 🌐 Azahrabot GitHub Repository Command (Clean Edition)

const settings = require("../settings");
const pkg = require("../package.json");

module.exports = async (sock, msg, from) => {
  try {
    // React to show it's working
    await sock.sendMessage(from, { react: { text: "🚀", key: msg.key } }).catch(() => {});
  } catch {}

  try {
    const repoUrl = settings.repoUrl || settings.updateZipUrl || "https://github.com/";
    const bannerUrl =
      "https://res.cloudinary.com/ds1lpf36n/image/upload/v1762079835/satoru-gojo-black-3840x2160-14684_1_amj5ys.png";

    const caption = `
👨‍💻 *${settings.botName} — GitHub Repository*
───────────────────────
✨ *Author:* ${settings.author || "AzarTech"}
📦 *Version:* ${settings.version || pkg.version}
🌐 *Platform:* WhatsApp (Baileys)
⚙️ *Language:* Node.js
📁 *Repository:* ${repoUrl}
───────────────────────
> *Powered by ${settings.author || "AzarTech"} ⚡*
    `.trim();

    const buttons = [
      { buttonId: `${settings.prefix}openrepo`, buttonText: { displayText: "🌐 Open Repo" }, type: 1 },
      { buttonId: `${settings.prefix}update`, buttonText: { displayText: "🧠 Update (Owner)" }, type: 1 },
      { buttonId: `${settings.prefix}owner`, buttonText: { displayText: "👑 Owner" }, type: 1 },
    ];

    const message = {
      image: { url: bannerUrl },
      caption,
      footer: `🔗 GitHub • ${repoUrl}`,
      buttons,
      headerType: 4,
    };

    await sock.sendMessage(from, message, { quoted: msg });
  } catch (err) {
    console.error("❌ Error in .repo command:", err.message);
    await sock.sendMessage(from, { text: "⚠️ Failed to load repository details." }, { quoted: msg });
  }
};
