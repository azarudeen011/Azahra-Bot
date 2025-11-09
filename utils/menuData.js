// ==============================================
// 🧾 Azahrabot Menu Data (v4.2.3 Optimized)
// Dynamic Menu System + Category Layout
// ==============================================

const settings = require("../settings"); // ✅ Load config globally

module.exports = {
  // 🖼 Banner shown in .menu command
  banner:
    "https://res.cloudinary.com/ds1lpf36n/image/upload/v1762079835/satoru-gojo-black-3840x2160-14684_1_amj5ys.png",

  // 📜 Dynamic menu generator function
  menuText: (dateStr, timeStr, currentMode = "public") => `
╭━━━〔 *🤖 ${settings.botName?.toUpperCase() || "AZAHRABOT"} MENU* 〕━━━╮
│ 👑 *Owner:* ${settings.botOwner || "Azar"}
│ 📞 *Number:* +${settings.ownerNumber || "918778901579"}
│ 💬 *Prefix:* ${settings.prefix || "."}
│ 🌐 *Mode:* ${currentMode.toUpperCase()}
│ ⚙️ *Version:* ${settings.version || "1.0.0"}
│ 📅 *Date:* ${dateStr}
│ ⏰ *Time:* ${timeStr}
│────────────────────────────
│ 🧠 *AI TOOLS*
│   • ${settings.prefix}gpt – ChatGPT AI
│   • ${settings.prefix}gemini – Gemini AI
│   • ${settings.prefix}flux – AI Image Generator
│────────────────────────────
│ ⚙️ *SYSTEM COMMANDS*
│   • ${settings.prefix}ping – Check bot speed
│   • ${settings.prefix}alive – Bot status
│   • ${settings.prefix}status – Runtime info
│   • ${settings.prefix}mode – Switch public/private
│   • ${settings.prefix}clearsession – Clear session cache
│   • ${settings.prefix}cleartemp – Clear temp files
│   • ${settings.prefix}update – Get latest version
│────────────────────────────
│ 📚 *INFORMATION*
│   • ${settings.prefix}owner – Owner info
│   • ${settings.prefix}weather – City weather
│   • ${settings.prefix}fact – Random fact
│   • ${settings.prefix}quote – Daily quote
│   • ${settings.prefix}advice – Random advice
│────────────────────────────
│ 🎭 *FUN ZONE*
│   • ${settings.prefix}joke – Random joke
│────────────────────────────
│ 🎥 *MEDIA / DOWNLOADERS*
│   • ${settings.prefix}vv – Reveal ViewOnce media
│   • ${settings.prefix}ig – Instagram downloader
│────────────────────────────
│ 💫 *SUPPORT & LINKS*
│   • ${settings.prefix}repo – GitHub Repository
│   • ${settings.prefix}channel – WhatsApp Updates
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> powered by *${settings.author || "AzarTech"} ⚡*
`,
};
