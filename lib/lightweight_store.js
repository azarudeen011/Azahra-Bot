// lib/lightweight_store.js
// 💾 Efficient persistent store (messages + contacts)
// Safely stores under /session/, optimized for AzahraBot

const fs = require("fs");
const path = require("path");

// ✅ Always use /session/ folder
const SESSION_DIR = path.join(__dirname, "../session");
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
  console.log("📁 Created /session folder for store data");
}

const STORE_FILE = path.join(SESSION_DIR, "baileys_store.json");
const BACKUP_FILE = path.join(SESSION_DIR, "baileys_store.bak.json");

let MAX_MESSAGES = 20;
try {
  const settings = require("../settings");
  if (settings.maxStoreMessages) MAX_MESSAGES = settings.maxStoreMessages;
} catch {}

// 🧠 Main Store Object
const store = {
  messages: {},
  contacts: {},
  chats: {},
  _lastWrite: 0, // internal throttle tracker

  readFromFile(file = STORE_FILE) {
    try {
      if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file));
        Object.assign(this, data);
      }
    } catch (err) {
      console.error("⚠️ Failed to read store:", err.message);
      // 🔄 Auto backup + reset
      try {
        fs.renameSync(file, BACKUP_FILE);
        console.log("📦 Backup created for corrupted store:", BACKUP_FILE);
      } catch {}
      this.messages = {};
      this.contacts = {};
      this.chats = {};
    }
  },

  writeToFile(file = STORE_FILE) {
    const now = Date.now();
    if (now - this._lastWrite < 5000) return; // throttle writes every 5s
    this._lastWrite = now;

    try {
      fs.writeFileSync(file, JSON.stringify(this, null, 2));
    } catch (err) {
      console.error("⚠️ Failed to write store:", err.message);
    }
  },

  bind(ev) {
    ev.on("messages.upsert", ({ messages }) => {
      for (const msg of messages) {
        const jid = msg.key.remoteJid;
        this.messages[jid] = this.messages[jid] || [];
        this.messages[jid].push(msg);
        if (this.messages[jid].length > MAX_MESSAGES)
          this.messages[jid].splice(0, this.messages[jid].length - MAX_MESSAGES);
      }
    });

    ev.on("contacts.update", (contacts) => {
      for (const c of contacts) {
        this.contacts[c.id] = { id: c.id, name: c.notify || c.name || "" };
      }
    });

    ev.on("chats.set", (chats) => {
      this.chats = {};
      for (const chat of chats) this.chats[chat.id] = chat;
    });
  },
};

module.exports = store;
