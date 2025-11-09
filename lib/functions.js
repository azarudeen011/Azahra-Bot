// ================================================
// 🧠 Message Serializer & Essential Helpers
// Azahrabot v4.9 — Fully Patched for Baileys v6+
// ================================================

const { getContentType, proto, jidDecode } = require("@whiskeysockets/baileys");
const fs = require("fs");
const Jimp = require("jimp");

// 🕒 Convert runtime seconds → readable format
exports.runtime = (seconds) => {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, s && `${s}s`]
    .filter(Boolean)
    .join(" ");
};

// 💬 Parse mentions
exports.parseMention = (text = "") =>
  [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net");

// 🖼 Generate WhatsApp-compliant profile picture
exports.generateProfilePicture = async (buffer) => {
  const jimp = await Jimp.read(buffer);
  const min = jimp.getWidth();
  const max = jimp.getHeight();
  const cropped = jimp.crop(0, 0, min, max);
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
  };
};

// ======================================================
// 🧠 Core Message Serializer
// ======================================================
exports.smsg = (sock, m, store) => {
  if (!m) return m;

  // ✅ Safe JID decode
  const safeDecodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
    }
    return jid;
  };

  // 🧩 Basic structure setup
  if (m.key) {
    m.id = m.key.id;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = (sock.decodeJid ? sock.decodeJid : safeDecodeJid)(
      m.fromMe && sock.user?.id || m.participant || m.key.participant || m.chat
    );
  }

  // 🧠 Extract content
  if (m.message) {
    m.mtype = getContentType(m.message);
    const inner = m.mtype === "viewOnceMessage"
      ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
      : m.message[m.mtype];

    m.msg = inner || m.message[m.mtype];

    // ✅ Universal text extractor (Baileys v6+ compatible)
    m.text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      m.message?.viewOnceMessage?.message?.extendedTextMessage?.text ||
      m.msg?.caption ||
      m.msg?.text ||
      m.msg?.contentText ||
      m.msg?.selectedDisplayText ||
      "";

    // 🧠 Handle quoted messages safely
    const ctx = m.msg?.contextInfo || {};
    const quoted = (m.quoted = ctx.quotedMessage ? ctx.quotedMessage : null);
    m.mentionedJid = ctx.mentionedJid || [];

    if (m.quoted) {
      const type = getContentType(quoted);
      m.quoted = quoted[type];
      m.quoted.id = ctx.stanzaId;
      m.quoted.chat = ctx.remoteJid || m.chat;
      m.quoted.sender = (sock.decodeJid ? sock.decodeJid : safeDecodeJid)(ctx.participant);
      m.quoted.text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.conversation ||
        m.quoted.contentText ||
        "";
      m.quoted.delete = () => sock.sendMessage(m.quoted.chat, { delete: ctx.key });
    }
  }

  // 🧾 Quick reply shortcut
  m.reply = (text, chatId = m.chat, options = {}) =>
    sock.sendMessage(chatId, { text, ...options }, { quoted: m });

  // ⬇️ Media downloader
  m.download = () => sock.downloadMediaMessage(m.msg);

  // ✂️ Clean text helper (removes prefix)
  m.cleanText = () => m.text?.replace(/^(\.|\/|\!)/, "").trim();

  return m;
};
