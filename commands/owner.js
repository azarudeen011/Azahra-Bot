// ==============================================
// 👑 Azahrabot Owner Command (v4.2.3 Clean Edition)
// No banner • Channel button only • vCard included
// ==============================================

const settings = require("../settings");

module.exports = async (sock, msg, from) => {
  try {
    // 👑 React to confirm command received
    await sock.sendMessage(from, { react: { text: "👑", key: msg.key } }).catch(() => {});
  } catch {}

  // 📞 Owner & Bot Details
  const ownerName = settings.botOwner || "AzarTech";
  const ownerNum = settings.ownerNumber?.replace(/[^0-9]/g, "") || "918778901579";
  const prefix = settings.prefix || ".";
  const version = settings.version || "1.0.0";
  const author = settings.author || "AzarTech";
  const channelLink = settings.channelLink || "https://whatsapp.com/channel/0029VbBF0t8J93wQxPYwla2v";

  // 🧾 Owner Information
  const caption = `
👑 *${ownerName} — Bot Owner*
━━━━━━━━━━━━━━━━━━━
📱 *Number:* wa.me/${ownerNum}
⚙️ *Prefix:* ${prefix}
💫 *Version:* ${version}
━━━━━━━━━━━━━━━━━━━
> *Powered by ${author} ⚡*
  `.trim();

  // 📇 Owner Contact (vCard)
  const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
TEL;type=CELL;type=VOICE;waid=${ownerNum}:+${ownerNum}
END:VCARD
  `.trim();

  try {
    // Send vCard contact first
    await sock.sendMessage(from, {
      contacts: {
        displayName: ownerName,
        contacts: [{ vcard }],
      },
    });

    // Send owner info with a single "View Channel" button
    await sock.sendMessage(
      from,
      {
        text: caption,
        footer: "🔗 Tap below to view AzahraBot Channel",
        buttons: [
          {
            buttonId: "view_channel",
            buttonText: { displayText: "📢 View Channel" },
            type: 1,
          },
        ],
        headerType: 1,
        viewOnce: true,
        contextInfo: {
          mentionedJid: [msg.sender],
          externalAdReply: {
            showAdAttribution: false,
            title: "AzahraBot Channel",
            body: "Official WhatsApp community",
            mediaType: 1,
            sourceUrl: channelLink,
          },
        },
      },
      { quoted: msg }
    );
  } catch (err) {
    console.error("❌ Owner command failed:", err.message);
    await sock.sendMessage(from, { text: "⚠️ Failed to send owner info." }, { quoted: msg });
  }
};
