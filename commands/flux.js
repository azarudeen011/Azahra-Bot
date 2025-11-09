// ==============================================
// 🎨 Azahrabot Flux AI Command (v4.2.3 - No Channel Preview)
// Free AI image generator using Pollinations API
// ==============================================

const axios = require("axios");
const settings = require("../settings");

module.exports = async (sock, msg, from, body, args) => {
  const prompt = args.join(" ").trim();

  // 💬 If no prompt, show usage hint
  if (!prompt) {
    await sock.sendMessage(
      from,
      {
        text: `🖼️ *Flux AI Generator*\n\nType your idea after the command.\nExample:\n${settings.prefix}flux cyberpunk samurai\n${settings.prefix}flux galaxy cat`,
      },
      { quoted: msg }
    );
    return;
  }

  // 🎨 React when user runs .flux
  try {
    await sock.sendMessage(from, { react: { text: "🎨", key: msg.key } }).catch(() => {});
  } catch {}

  // Step 1: Notify user
  await sock.sendMessage(
    from,
    { text: "⌛ *Generating your masterpiece...* 🎨\nPlease wait 5-10 seconds ⏳" },
    { quoted: msg }
  );

  try {
    // Step 2: Create detailed AI prompt
    const enhancedPrompt = `${prompt}, hyper-realistic, cinematic lighting, vivid colors, digital art, HD detail, trending on ArtStation, ultra sharp`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);

    // Step 3: Request image from Pollinations API
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=1080&seed=${Math.floor(Math.random() * 10000)}`;

    // Step 4: Prepare caption
    const caption = `
🎨 *Flux AI Image Generator*
──────────────────────
✨ *Prompt:* ${prompt}
🌐 *Engine:* Pollinations AI (HD)
──────────────────────
> powered by *${settings.author || "AzarTech"} ⚡*
`.trim();

    await sock.sendMessage(
      from,
      {
        image: { url: imageUrl },
        caption
      },
      { quoted: msg }
    );

    // ✅ React done
    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
  } catch (err) {
    console.error("❌ Flux AI Error:", err.message);

    // Step 5: Fallback if Pollinations fails
    const fallbackImage =
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80";

    await sock.sendMessage(
      from,
      {
        image: { url: fallbackImage },
        caption:
          "⚠️ The AI server took a nap 😴\nHere's a random HD visual instead.\n\n> powered by 𝘼𝙯𝙖𝙧𝙏𝙚𝙘𝙝 ⚡",
      },
      { quoted: msg }
    );

    // ⚠️ React with warning
    await sock.sendMessage(from, { react: { text: "⚠️", key: msg.key } }).catch(() => {});
  }
};
