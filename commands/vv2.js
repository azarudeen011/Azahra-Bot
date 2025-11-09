// =============================================
// 👁️ Azahrabot Private ViewOnce Revealer (v5.3 Secure + Anti-Ban)
// Safe • Silent • Owner-Only • Stealth Upload Delay
// =============================================

const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const P = require("pino");
const settings = require("../settings");
const secure = require("../lib/small_lib");

module.exports = async (sock, msg, from) => {
  try {
    // ✅ Restrict strictly to the paired owner
    const ownerNumber = (settings.ownerNumber || "").replace(/[^0-9]/g, "");
    const ownerJid = `${ownerNumber}@s.whatsapp.net`;
    const sender = msg.key.participant || msg.key.remoteJid || "";
    const isOwner = msg.key.fromMe || sender.includes(ownerNumber);
    if (!isOwner) {
      await sock.sendMessage(from, { text: "❌ Only the bot owner can use this command." }, { quoted: msg });
      return;
    }

    // 🧩 Ensure /temp folder always exists
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // ⚠️ Must reply to a ViewOnce message
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      await sock.sendMessage(from, { text: "❗ Reply to a *ViewOnce* image or video and use .vv2" }, { quoted: msg });
      return;
    }

    // 🧠 Detect ViewOnce message
    let mediaMessage;
    if (quoted?.viewOnceMessage?.message) {
      mediaMessage = { message: quoted.viewOnceMessage.message };
    } else if (quoted?.viewOnceMessageV2?.message) {
      mediaMessage = { message: quoted.viewOnceMessageV2.message };
    } else if (quoted?.imageMessage || quoted?.videoMessage) {
      mediaMessage = { message: quoted };
    }

    if (!mediaMessage) {
      await sock.sendMessage(from, { text: "⚠️ That message doesn't contain valid ViewOnce media." }, { quoted: msg });
      return;
    }

    // 📥 Download safely with retry
    let buffer;
    try {
      buffer = await downloadMediaMessage(mediaMessage, "buffer", {}, { logger: P({ level: "silent" }) });
    } catch (err) {
      if (err.code === "ENOENT") {
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        buffer = await downloadMediaMessage(mediaMessage, "buffer", {}, { logger: P({ level: "silent" }) });
      } else throw err;
    }

    const isVideo = !!mediaMessage.message.videoMessage;
    const caption = `👁️ *Private ViewOnce Retrieved*\n━━━━━━━━━━━━━━━\n> Saved securely to your own chat\n> powered by ${secure.author} ⚡`;

    // 🕐 Random short delay to mimic real user upload behavior (Anti-Ban)
    const delay = Math.floor(2000 + Math.random() * 3000); // 2–5 sec
    await new Promise(res => setTimeout(res, delay));

    // 📤 Send only to owner's chat, never to group or origin
    await sock.sendMessage(ownerJid, {
      [isVideo ? "video" : "image"]: buffer,
      mimetype: isVideo ? "video/mp4" : "image/jpeg",
      caption,
    });

    // 🕵️ Delete your original ".vv2" command silently (stealth mode)
    try {
      await sock.sendMessage(from, { delete: msg.key });
    } catch {}

  } catch (err) {
    console.error("❌ VV2 Safe Error:", err);
    await sock.sendMessage(from, { text: `⚠️ Error: ${err.message}` }, { quoted: msg });
  }
};
