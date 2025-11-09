// commands/gpt.js
const axios = require("axios");
const settings = require("../settings"); // ✅ Use settings.js for API key and other info

// memory for chat history (per user)
const chatMemory = {};

module.exports = async (sock, msg, from, text, args = []) => {
  const prompt = args.join(" ").trim();

  if (!prompt) {
    await sock.sendMessage(
      from,
      {
        text:
          `💬 *${settings.botName || "Azahra Bot"} GPT*\n\n` +
          `Type something after ${settings.prefix || "."}gpt like:\n` +
          `\`${settings.prefix || "."}gpt tell me a random fact\`\n` +
          `\`${settings.prefix || "."}gpt how’s the weather on Mars?\``,
      },
      { quoted: msg }
    );
    return;
  }

  // auto react 🤖
  try {
    await sock.sendMessage(from, { react: { text: "🤖", key: msg.key } });
  } catch (e) {
    console.log("Reaction failed:", e.message);
  }

  // show typing indicator
  await sock.sendPresenceUpdate("composing", from);

  // ✅ Use key from settings.js (fallback to process.env)
  const key = settings.openRouterKey || process.env.OPENROUTER_KEY;
  if (!key) {
    await sock.sendMessage(
      from,
      { text: "⚠️ Missing OpenRouter API Key — add it in settings.js or Replit Secrets." },
      { quoted: msg }
    );
    return;
  }

  // initialize memory for user
  if (!chatMemory[from]) chatMemory[from] = [];

  // store user message
  chatMemory[from].push({ role: "user", content: prompt });

  // keep only last 10 messages
  if (chatMemory[from].length > 10)
    chatMemory[from].splice(0, chatMemory[from].length - 10);

  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              `${settings.botName || "Azahra Bot"} GPT — a friendly, human-like WhatsApp AI. Keep replies short, natural, and conversational.`,
          },
          ...chatMemory[from],
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": "https://openrouter.ai",
          "X-Title": `${settings.botName || "Azahra Bot"} WhatsApp Bot`,
        },
        timeout: 45000,
      }
    );

    const reply =
      res.data?.choices?.[0]?.message?.content?.trim() ||
      "😅 Sorry, I couldn’t think of a response.";

    // save bot response to memory
    chatMemory[from].push({ role: "assistant", content: reply });

    // reply simply like a chat
    await sock.sendMessage(from, { text: reply }, { quoted: msg });
  } catch (err) {
    console.error("GPT Error:", err.response?.data || err.message);

    let fail =
      err.response?.status === 401
        ? "⚠️ Invalid or expired API key."
        : err.code === "ECONNABORTED"
        ? "⏳ Request timed out — try again."
        : "😕 AI servers might be slow — try again soon.";

    await sock.sendMessage(from, { text: fail }, { quoted: msg });
  } finally {
    await sock.sendPresenceUpdate("paused", from);
  }
};
