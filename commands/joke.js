// ==============================================
// 🤣 Azahrabot Joke Command (v4.2.3)
// Fetches random jokes + local fallback support
// ==============================================

const axios = require("axios");
const settings = require("../settings");

module.exports = async (sock, msg, from) => {
  try {
    // React instantly when command triggered
    await sock.sendMessage(from, {
      react: { text: "🤣", key: msg.key },
    }).catch(() => {});
  } catch {}

  try {
    // 🎭 Fetch joke from public API
    const res = await axios.get("https://official-joke-api.appspot.com/random_joke", {
      headers: { "User-Agent": "Azahrabot/4.2.3" },
      timeout: 5000,
    });

    const jokeText = `
🤣 *Here's a Joke for You!*
──────────────────────
${res.data.setup}
😂 ${res.data.punchline}
──────────────────────
> powered by *${settings.author || "AzarTech"} 🤖*
    `.trim();

    await sock.sendMessage(from, { text: jokeText }, { quoted: msg });
  } catch (err) {
    console.log("❌ Joke API error:", err.message);

    // 🧠 Fallback jokes if API fails
    const fallback = [
      "💀 Why don’t skeletons fight each other? They don’t have the guts!",
      "🖥️ I told my computer I needed a break — it said, 'No problem, I’ll go to sleep.'",
      "📏 Parallel lines have so much in common. It’s a shame they’ll never meet.",
      "💸 Why did the developer go broke? Because he used up all his cache.",
      "🔍 Debugging: Being the detective in a crime movie where you are also the murderer.",
      "🎧 Why do Java developers wear glasses? Because they don’t see sharp!",
    ];

    const randomJoke = fallback[Math.floor(Math.random() * fallback.length)];

    const fallbackText = `
😂 *Here's a Random Joke!*
──────────────────────
${randomJoke}
──────────────────────
> powered by *${settings.author || "AzarTech"} 🤖*
    `.trim();

    await sock.sendMessage(from, { text: fallbackText }, { quoted: msg });
  }
};
