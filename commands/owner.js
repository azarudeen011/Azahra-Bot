// ==============================================
// 👑 Azahrabot Owner Command (v4.9 Polished Edition)
// Single Banner • View Channel Button • Clean Design
// ==============================================

const secure = require("../lib/small_lib"); // ✅ Secure info file

module.exports = async (sock, msg, from) => {
  try {
    // 👑 React to confirm command trigger
    await sock.sendMessage(from, { react: { text: "👑", key: msg.key } }).catch(() => {});
  } catch {}

  // 💡 Owner & Bot Info
  const ownerName = secure.ownerName;
  const ownerNum = secure.ownerNumber;
  const botName = secure.botName;
  const author = secure.author;
  const channel = secure.channel;
  const prefix = ".";
  const version = "4.9";

  const banner = channel.banner;

  // 📇 Owner vCard
  const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
TEL;type=CELL;type=VOICE;waid=${ownerNum}:+${ownerNum}
END:VCARD
  `.trim();

  // 🧾 Info message
  const caption = `
👑 *${ownerName} — Official Owner*
━━━━━━━━━━━━━━━━━━━
🤖 *Bot:* ${botName}
📱 *Number:* wa.me/${ownerNum}
💫 *Version:* ${version}
⚙️ *Prefix:* ${prefix}
━━━━━━━━━━━━━━━━━━━
> *Powered by ${author} ⚡*
  `.trim();

  try {
    // 📤 Step 1: Send vCard contact
    await sock.sendMessage(from, {
      contacts: {
        displayName: ownerName,
        contacts: [{ vcard }],
      },
    });

    // 🖼 Step 2: Send banner + channel button
    await sock.sendMessage(
      from,
      {
        image: { url: banner },
        caption,
        footer: "🔗 Tap below to view AzahraBot Channel",
        buttons: [
          {
            buttonId: "view_channel",
            buttonText: { displayText: "📢 View Channel" },
            type: 1,
          },
        ],
        headerType: 4,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: false,
            title: channel.name,
            body: "Join for bot updates & new features!",
            thumbnailUrl: banner,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: channel.link,
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
