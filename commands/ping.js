// ==============================================
// ⚡ Azahrabot Ping Command (v4.9 Ultra-Light)
// React • Measure • Reply with Ping Only
// ==============================================

const secure = require("../lib/small_lib"); // 🧠 For fixed bot name + author

module.exports = async (sock, msg, from) => {
  try {
    // ⚡ React instantly
    await sock.sendMessage(from, { react: { text: "⚡", key: msg.key } }).catch(() => {});
  } catch {}

  try {
    // 🎈 Send pinging indicator
    const start = Date.now();
    await sock.sendMessage(from, { text: "🎈 *Pong...*" });
    const ping = (Date.now() - start).toFixed(2);

    // ✅ Reply only with ping value
    await sock.sendMessage(from, { text: `*AZAHRA SPEED = ${ping} ms ⚡*` }, { quoted: msg });
  } catch (err) {
    console.error("❌ Ping command error:", err.message);
    await sock.sendMessage(from, { text: "⚠️ Ping test failed." }, { quoted: msg });
  }
};
