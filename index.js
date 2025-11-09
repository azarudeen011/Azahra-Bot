// ==============================================
// 🔥 Azahrabot v4.7 (MS Pair Flow + Stable Hosting)
// Instant Pairing • Owner Notification • Mode Control • Safe Store
// ==============================================

require('./main.js');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  downloadMediaMessage
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const P = require("pino");
const chalk = require("chalk");
const readline = require("readline");
const settings = require("./settings");
const { normalize } = require("./utils/helper"); // 🧠 Added helper import

// 🧠 Load persistent store
const store = require("./lib/lightweight_store");
store.readFromFile();
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000);

// 💾 RAM protection
setInterval(() => {
  if (global.gc) global.gc();
  const used = process.memoryUsage().rss / 1024 / 1024;
  if (used > 400) {
    console.log(chalk.red(`⚠️ High RAM usage (${used.toFixed(1)} MB). Restarting...`));
    process.exit(1);
  }
}, 60000);

// 📁 Multi-user session
function getSessionPath() {
  const id = process.env.SESSION_ID || "default";
  const dir = path.join(__dirname, `auth_info_${id}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "session_here"), "");
    console.log(chalk.blue(`📁 Session created: auth_info_${id}`));
  }
  return dir;
}

// ======================================================
// 🚀 Start Bot
// ======================================================
async function startAzahraBot() {
  const sessionPath = getSessionPath();
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  global.sock = sock;
  store.bind(sock.ev);
  sock.ev.on("creds.update", saveCreds);

  // ======================================================
  // 📱 Pairing Code (MS BOT FLOW)
  // ======================================================
  if (!state.creds?.registered) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (text) => new Promise((res) => rl.question(text, res));
    const phoneNumber = await question("📱 Enter your WhatsApp number (with country code): ");
    rl.close();

    try {
      await sock.requestPairingCode(phoneNumber.trim());
      setTimeout(() => {
        const code = sock.authState.creds?.pairingCode;
        if (code) {
          console.log("\n🔗 Pair this device using this code in WhatsApp:\n");
          console.log(chalk.greenBright("   " + code + "\n"));
          console.log("Go to WhatsApp → Linked Devices → Link with code.\n");
        } else {
          console.log(chalk.red("❌ Pairing code not found."));
        }
      }, 1000);
    } catch (err) {
      console.error("❌ Pairing failed:", err.message);
    }
  }

  // ======================================================
  // 📡 Connection Handling
  // ======================================================
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") {
      console.clear();
      console.log(chalk.greenBright(`✅ ${settings.botName} connected successfully!`));
      console.log(chalk.yellow(`👑 Owner: ${settings.botOwner} (${settings.ownerNumber})`));
      console.log(chalk.cyan(`🌐 Mode: ${getMode().toUpperCase()}`));
      console.log(chalk.blue(`⚙️ Version: ${settings.version}\n`));

      const ownerJid = settings.ownerNumber.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      const time = new Date().toLocaleString();
      const msgText = `🤖 *${settings.botName} Connected Successfully!*\n\n⏰ *Time:* ${time}\n✅ *Status:* Online`;

      try {
        await sock.sendMessage(ownerJid, {
          text: msgText,
          contextInfo: {
            externalAdReply: {
              title: "AzahraBot — Official Channel 💫",
              body: "",
              mediaType: 1,
              renderLargerThumbnail: true,
              thumbnailUrl: "https://res.cloudinary.com/ds1lpf36n/image/upload/v1762079835/satoru-gojo-black-3840x2160-14684_1_amj5ys.png",
              sourceUrl: "https://whatsapp.com/channel/0029VbBF0t8J93wQxPYwla2v"
            }
          }
        });
        console.log(chalk.green("📩 Sent connection notification to owner."));
      } catch {
        console.log(chalk.red("⚠️ Could not send startup message."));
      }
    }
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red("❌ Connection closed."));
      if (shouldReconnect) startAzahraBot();
      else console.log(chalk.red("⚠️ Logged out. Delete auth_info and re-pair."));
    }
  });

  // ======================================================
  // ⚙️ Mode system (public/private)
  // ======================================================
  const modeFile = path.join(__dirname, "data/botMode.json");
  function getMode() {
    try {
      return JSON.parse(fs.readFileSync(modeFile)).mode || "public";
    } catch {
      return "public";
    }
  }
  function setMode(mode) {
    if (!fs.existsSync(path.dirname(modeFile))) fs.mkdirSync(path.dirname(modeFile), { recursive: true });
    fs.writeFileSync(modeFile, JSON.stringify({ mode }, null, 2));
  }

  // ======================================================
  // 📦 Command Loader
  // ======================================================
  const commands = {};
  const cmdDir = path.join(__dirname, "commands");
  if (fs.existsSync(cmdDir)) {
    fs.readdirSync(cmdDir)
      .filter((f) => f.endsWith(".js"))
      .forEach((f) => {
        try {
          const name = f.replace(".js", "");
          commands[name] = require(path.join(cmdDir, f));
          console.log(chalk.green(`📦 Loaded: ${name}`));
        } catch (err) {
          console.error(`⚠️ Failed: ${f}`, err.message);
        }
      });
  }

  // ======================================================
  // 💬 Message Handler
  // ======================================================
  const { smsg } = require("./lib/functions");
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const m = smsg(sock, msg, store);
    const from = m.chat;
    const text = m.text?.trim();
    if (!text) return;

    const normalized = normalize(text); // ✅ Clean input using helper
    const [cmd, ...args] = normalized.split(/\s+/);
    const commandName = cmd.toLowerCase();

    // 🔧 MODE COMMAND
    if (commandName === "mode") {
      const sender = msg.key.participant || msg.key.remoteJid;
      const owner = settings.ownerNumber.replace(/[^0-9]/g, "");
      const isOwner = msg.key.fromMe || (sender && sender.includes(owner));
      const arg = args[0]?.toLowerCase();

      if (!arg)
        return sock.sendMessage(from, { text: `📢 Current Mode: *${getMode().toUpperCase()}*` }, { quoted: msg });

      if (!isOwner)
        return sock.sendMessage(from, { text: "❌ Only the bot owner can change mode." }, { quoted: msg });

      if (!["public", "private"].includes(arg))
        return sock.sendMessage(from, { text: "⚙️ Use `.mode public` or `.mode private`" }, { quoted: msg });

      setMode(arg);
      return sock.sendMessage(from, { text: `✅ Bot mode updated to *${arg.toUpperCase()}*` }, { quoted: msg });
    }

    // 🚫 Block non-owner commands in private mode
    const mode = getMode();
    const sender = msg.key.participant || msg.key.remoteJid;
    const owner = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = msg.key.fromMe || (sender && sender.includes(owner));
    if (mode === "private" && !isOwner) return;

    // ✅ Execute command
    if (commands[commandName]) {
      try {
        await commands[commandName](sock, msg, from, text, args);
      } catch (err) {
        console.error("❌ Command failed:", err);
        await sock.sendMessage(from, { text: "❌ Command failed." }, { quoted: msg });
      }
    }
  });
}

// ======================================================
// 🟢 Start bot
// ======================================================
startAzahraBot();

// Auto reload for development
const file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`🔄 Reloading ${__filename}`));
  delete require.cache[file];
  require(file);
});
