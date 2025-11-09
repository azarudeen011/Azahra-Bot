// ==============================================
// ⚙️ Azahrabot Settings (User Editable)
// Handles connection, prefix, and runtime behavior.
// ==============================================

const smallLib = require("./lib/small_lib");

const settings = {
  // 👑 Owner Info (used for pairing and control)
  botOwner: "User", // User name
  ownerNumber: "917358646943", // Replace with your number (country code, no +)

  // 💬 Behavior Settings
  commandMode: "public", // "public" or "private"
  prefix: ".",
  maxStoreMessages: 20,
  storeWriteInterval: 10000,

  // 🧠 Version Info (used internally)
  version: "1.0.0",

  // Bot Description 
  description: "Multi-feature WhatsApp bot built with Baileys.",

  updateZipUrl: smallLib.updateZipUrl,
};

module.exports = settings;

