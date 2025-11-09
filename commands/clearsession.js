const fs = require("fs");
const path = require("path");

module.exports = async (sock, msg, from) => {
  try {
    // only owner can use
    if (!msg.key.fromMe) {
      return await sock.sendMessage(from, { text: "❌ This command is only for the owner!" });
    }

    const sessionDir = path.join(process.cwd(), "auth_info_default");
    if (!fs.existsSync(sessionDir)) {
      return await sock.sendMessage(from, { text: "❌ Session directory not found!" });
    }

    await sock.sendMessage(from, { text: "🔍 Optimizing session files..." });

    const files = fs.readdirSync(sessionDir);
    let filesCleared = 0, appState = 0, preKeys = 0;

    for (const file of files) {
      if (file === "creds.json") continue; // don't delete connection creds
      if (file.startsWith("app-state-sync-")) appState++;
      if (file.startsWith("pre-key-")) preKeys++;
      fs.rmSync(path.join(sessionDir, file), { recursive: true, force: true });
      filesCleared++;
    }

    const message = `✅ *Session Cleanup Done!*
📦 Files Cleared: ${filesCleared}
📁 AppState: ${appState}
🔑 PreKeys: ${preKeys}

🧠 Session optimized.`;

    await sock.sendMessage(from, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: "AzahraBot — Official Channel",
          body: "",
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnailUrl: "https://res.cloudinary.com/ds1lpf36n/image/upload/v1762079835/satoru-gojo-black-3840x2160-14684_1_amj5ys.png",
          sourceUrl: "https://whatsapp.com/channel/0029VbBF0t8J93wQxPYwla2v"
        }
      }
    });

  } catch (err) {
    console.error("Error in clearsession:", err);
    await sock.sendMessage(from, { text: "❌ Failed to clear session files!" });
  }
};
