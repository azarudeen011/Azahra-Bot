const fs = require("fs");
const path = require("path");

module.exports = async (sock, msg, from) => {
  try {
    if (!msg.key.fromMe) {
      return await sock.sendMessage(from, { text: "❌ This command is only for the owner!" });
    }

    const tempDirs = [path.join(process.cwd(), "temp"), path.join(process.cwd(), "tmp")];
    let totalCleared = 0;

    for (const dir of tempDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        try {
          fs.rmSync(path.join(dir, file), { recursive: true, force: true });
          totalCleared++;
        } catch {}
      }
    }

    const message = `🧹 *Temp Files Cleanup Done!*
🗂️ Files Removed: ${totalCleared}

⚡ Bot is still active & running fine.`;

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
    console.error("Error in cleartemp:", err);
    await sock.sendMessage(from, { text: "❌ Failed to clear temp files!" });
  }
};
