// ==============================================
// 🧠 Azahrabot ClearSession Command (v5.0 Clean)
// Safely optimizes Baileys session files — owner only
// ==============================================

const fs = require("fs");
const path = require("path");

module.exports = async (sock, msg, from) => {
  try {
    // ✅ Restrict to bot owner only
    if (!msg.key.fromMe) {
      return await sock.sendMessage(from, { text: "❌ This command is only for the owner!" }, { quoted: msg });
    }

    const sessionDir = path.join(process.cwd(), "auth_info_default");

    // 🧩 Check session folder
    if (!fs.existsSync(sessionDir)) {
      return await sock.sendMessage(from, { text: "⚠️ Session directory not found!" }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "🔍 Optimizing session files..." }, { quoted: msg });

    const files = fs.readdirSync(sessionDir);
    let filesCleared = 0, appState = 0, preKeys = 0;

    // 🧹 Clean unnecessary Baileys session files
    for (const file of files) {
      if (file === "creds.json") continue; // don’t touch creds (core connection)
      if (file.startsWith("app-state-sync-")) appState++;
      if (file.startsWith("pre-key-")) preKeys++;
      fs.rmSync(path.join(sessionDir, file), { recursive: true, force: true });
      filesCleared++;
    }

    // 🧾 Build response message
    const message = `
🧠 *Session Cleanup Complete!*
━━━━━━━━━━━━━━━━━━━
📦 *Files Removed:* ${filesCleared}
📁 *AppState:* ${appState}
🔑 *PreKeys:* ${preKeys}
━━━━━━━━━━━━━━━━━━━
✅ Session optimized — smoother performance!
> powered by *AzarTech ⚡*
`.trim();

    await sock.sendMessage(from, { text: message }, { quoted: msg });

  } catch (err) {
    console.error("❌ Error in clearsession:", err.message);
    await sock.sendMessage(from, { text: "⚠️ Failed to clear session files." }, { quoted: msg });
  }
};
