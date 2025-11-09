// commands/vv.js
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const P = require("pino");

module.exports = async (sock, msg, from) => {
  try {
    // ⏳ Step 1: React when processing starts
    await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });
  } catch (err) {
    console.log("Reaction failed:", err.message);
  }

  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let mediaMessage;

    // ✅ Support for ViewOnce (v1 + v2)
    if (
      quoted?.viewOnceMessage?.message?.imageMessage ||
      quoted?.viewOnceMessage?.message?.videoMessage
    ) {
      mediaMessage = { message: quoted.viewOnceMessage.message };
    } else if (
      quoted?.viewOnceMessageV2?.message?.imageMessage ||
      quoted?.viewOnceMessageV2?.message?.videoMessage
    ) {
      mediaMessage = { message: quoted.viewOnceMessageV2.message };
    } else if (quoted?.imageMessage || quoted?.videoMessage) {
      mediaMessage = { message: quoted };
    }

    if (!mediaMessage) {
      await sock.sendMessage(
        from,
        { text: "❗ Reply to a ViewOnce image or video to reveal it." },
        { quoted: msg }
      );
      await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
      return;
    }

    // 🧠 Download media
    const buffer = await downloadMediaMessage(
      mediaMessage,
      "buffer",
      {},
      { logger: P({ level: "silent" }) }
    );

    const isVideo = !!mediaMessage.message.videoMessage;

    // 🎥 Send revealed media
    await sock.sendMessage(
      from,
      {
        [isVideo ? "video" : "image"]: buffer,
        caption: "*👁️ ViewOnce Revealed by Azahra Bot*\n> powered by 𝘼𝙯𝙖𝙧𝙏𝙚𝙘𝙝 ⚡",
      },
      { quoted: msg }
    );

    // ✅ React when done
    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
  } catch (err) {
    console.error("VV Error:", err.message);
    await sock.sendMessage(
      from,
      { text: "⚠️ Failed to fetch or reveal this media. Try again." },
      { quoted: msg }
    );
    await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
  }
};