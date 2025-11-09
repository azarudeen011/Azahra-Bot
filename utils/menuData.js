// ==============================================
// 🧾 Azahrabot Menu Data (v4.2.5)
// Dynamic Menu System + Locked Branding + User Owner
// ==============================================

const settings = require("../settings");      // user-access configs
const secure = require("../lib/small_lib");  

module.exports = {
  
  banner: secure.channel.banner,

  // 📜 Dynamic Menu Generator
  menuText: (dateStr, timeStr, currentMode = "public") => `
╭━━━〔 *🤖 ${secure.botName.toUpperCase()} MENU* 〕━━━╮
│ 👑 *Creator:* ${secure.ownerName || "Azar"}
│ 👤 *User:* ${settings.botOwner || "User"}
│ 💬 *Prefix:* ${settings.prefix || "."}
│ 🌐 *Mode:* ${currentMode.toUpperCase()}
│ ⚙️ *Version:* ${settings.version || "1.0.0"}
│ 📅 *Date:* ${dateStr}
│ ⏰ *Time:* ${timeStr}
│────────────────────
│ 🧠 *AI TOOLS*
│   • ${settings.prefix}gpt 
│   • ${settings.prefix}gemini
│   • ${settings.prefix}flux  
│───────────────────── 
│ ⚙️ *SYSTEM COMMANDS*
│   • ${settings.prefix}ping
│   • ${settings.prefix}alive
│   • ${settings.prefix}status
│   • ${settings.prefix}mode 
│   • ${settings.prefix}clearsession
│   • ${settings.prefix}cleartemp 
│   • ${settings.prefix}update
│─────────────────────
│ 📚 *INFORMATION*
│   • ${settings.prefix}owner
│   • ${settings.prefix}weather 
│   • ${settings.prefix}fact 
│   • ${settings.prefix}quote 
│   • ${settings.prefix}advice
│─────────────────────
│ 🎭 *FUN ZONE*
│   • ${settings.prefix}joke 
│─────────────────────
│ 🎥 *MEDIA / DOWNLOADERS*
│   • ${settings.prefix}vv 
│   • ${settings.prefix}vv2
│   • ${settings.prefix}ig
│   • ${settings.prefix}play
│─────────────────────
│ 💫 *SUPPORT & LINKS*
│   • ${settings.prefix}repo 
│   • ${settings.prefix}channel
╰━━━━━━━━━━━━━━━━━━━━╯
> built by *${secure.author || "AzarTech"}* ⚡
`,
};
