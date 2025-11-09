// settings.js
const settings = {
  // ⚙️ Basic Information
  packname: "Azahra Bot",
  author: "AzarTech",
  botName: "Azahra Bot",
  botOwner: "Azar", // Your name
  ownerNumber: "918778901579", // Your number (without + symbol)

  updateZipUrl: "https://github.com/azarudeen011/Azahra-Bot/archive/refs/heads/main.zip",

  // 💬 Behaviour Settings
  commandMode: "public", // "public" or "private"
  prefix: ".",
  maxStoreMessages: 20,
  storeWriteInterval: 10000,

  // 🧠 AI + Integrations
  openRouterKey: process.env.OPENROUTER_KEY || "", 
  giphyApiKey: "", // optional, public

  // 📦 Bot Info
  description: "Azahra Bot - A powerful multi-feature WhatsApp bot built with Baileys.",
  version: "1.0.0",

  // 🔗 Important Links
  repoUrl: "https://github.com/azarudeen011/Azahra-Bot",

  // 🌐 Channel / Community Info
  channelLink: "https://whatsapp.com/channel/0029VbBF0t8J93wQxPYwla2v", 
};

module.exports = settings;
