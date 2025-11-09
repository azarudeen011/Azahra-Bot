// =============================================
// 👁️ Azahrabot ViewOnce Revealer (v4.2.5)
// Works on v1 + v2 ViewOnce formats • Stable + Safe
// =============================================

const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const P = require("pino");
const secure = require("../lib/small_lib"); // ✅ for branding info

module.exports = async (sock, msg, from) => {
  try {
    // ⏳ Step 1: React to show processing started
    await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });
  } catch (err) {
    console.log("Reaction failed:", err.message);
  }

  try {
    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    let mediaMessage;

    // ✅ Support for ViewOnce v1 + v2
    if (quoted?.viewOnceMessage?.message?.imageMessage ||
        quoted?.viewOnceMessage?.message?.videoMessage) {
      mediaMessage = { message: quoted.viewOnceMessage.message };
    } else if (quoted?.viewOnceMessageV2?.message?.imageMessage ||
               quoted?.viewOnceMessageV2?.message?.videoMessage) {
      mediaMessage = { message: quoted.viewOnceMessageV2.message };
    } else if (quoted?.imageMessage || quoted?.videoMessage) {
      mediaMessage = { message: quoted };
    }

    // ⚠️ If no media detected
    if (!mediaMessage) {
      await sock.sendMessage(
        from,
        { text: "❗ Reply to a *ViewOnce* image or video to reveal it." },
        { quoted: msg }
      );
      await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
      return;
    }

    // 🧠 Step 2: Download the media
    const buffer = await downloadMediaMessage(
      mediaMessage,
      "buffer",
      {},
      { logger: P({ level: "silent" }) }
    );

    const isVideo = !!mediaMessage.message.videoMessage;

    // 🎥 Step 3: Send revealed media
    await sock.sendMessage(
      from,
      {
        [isVideo ? "video" : "image"]: buffer,
        caption: `> powered by ${secure.author} ⚡`,
      },
      { quoted: msg }
    );

    // ✅ Step 4: React when done
    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
  } catch (err) {
    console.error("❌ VV Error:", err.message);
    await sock.sendMessage(
      from,
      { text: "⚠️ Failed to reveal media. Try again or re-send it." },
      { quoted: msg }
    );
    await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
  }
};
