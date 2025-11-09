// ==============================================
// 🆔 Azahrabot JID Fetcher (v4.8)
// Get JID for any user, group, or channel
// ==============================================

module.exports = async (sock, msg, from) => {
  try {
    // React to confirm trigger
    await sock.sendMessage(from, { react: { text: "🔍", key: msg.key } }).catch(() => {});
  } catch {}

  try {
    let targetJid;

    // 🧠 If the user replied to a message — use that JID
    if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      targetJid = msg.message.extendedTextMessage.contextInfo.participant;
    }

    // 🧠 If the message is from a group
    else if (from.endsWith("@g.us")) {
      targetJid = from;
    }

    // 🧠 If it’s a direct chat
    else if (from.endsWith("@s.whatsapp.net")) {
      targetJid = from;
    }

    // 🧠 If it’s from a newsletter (channel)
    else if (from.endsWith("@newsletter")) {
      targetJid = from;
    }

    // 🧠 Fallback to participant or remoteJid if nothing matched
    else {
      targetJid =
        msg.key?.participant || msg.key?.remoteJid || "❌ Unable to detect JID.";
    }

    // 💬 Format result
    const resultText = `
🆔 *JID Information*
────────────────────
👤 *Detected JID:*
\`${targetJid}\`

📍 *Type:* ${
      targetJid.includes("@g.us")
        ? "Group"
        : targetJid.includes("@newsletter")
        ? "Channel"
        : targetJid.includes("@s.whatsapp.net")
        ? "User"
        : "Unknown"
    }

────────────────────
> ⚡ Powered by AzarTech
`.trim();

    await sock.sendMessage(from, { text: resultText }, { quoted: msg });

    // ✅ React success
    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
  } catch (err) {
    console.error("❌ JID command failed:", err.message);
    await sock.sendMessage(
      from,
      { text: "⚠️ Failed to get JID info. Try replying to a message or sending in a group." },
      { quoted: msg }
    );
    await sock.sendMessage(from, { react: { text: "❌", key: msg.key } }).catch(() => {});
  }
};
