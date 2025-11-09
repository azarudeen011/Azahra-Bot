// ==============================================
// 🎬 Azahrabot Instagram Downloader (v5.4 Stable)
// Using Violetics API — Supports Posts, Reels, Stories
// ==============================================

const axios = require("axios");

module.exports = async (sock, msg, from, text, args = []) => {
  const igUrl = args.join(" ").trim();
  if (!igUrl) {
    return await sock.sendMessage(
      from,
      {
        text: "📥 Usage: .ig <instagram url>\n\nExample:\n.ig https://www.instagram.com/reel/XXXXXXX",
      },
      { quoted: msg }
    );
  }

  try {
    // 🎵 React & notify user
    await sock.sendMessage(from, { react: { text: "📸", key: msg.key } }).catch(() => {});
    await sock.sendMessage(from, { text: "🔍 Fetching Instagram media... please wait ⏳" }, { quoted: msg });

    // ⚙️ Fetch data from Violetics API
    const apiUrl = `https://api-violetics.vercel.app/api/download/instagram?url=${encodeURIComponent(igUrl)}`;
    const { data } = await axios.get(apiUrl, { timeout: 25000 });

    // 🧾 Validate response
    if (!data || !data.result || !data.result.data || data.result.data.length === 0) {
      return await sock.sendMessage(from, { text: "⚠️ No media found or invalid Instagram URL." }, { quoted: msg });
    }

    const medias = data.result.data;
    let sentCount = 0;

    // 🧩 Loop through media files (max 10 for safety)
    for (const media of medias.slice(0, 10)) {
      try {
        const url = media.url;
        const type = media.type?.toLowerCase() || (url.includes(".mp4") ? "video" : "image");

        if (type === "video") {
          await sock.sendMessage(
            from,
            {
              video: { url },
              mimetype: "video/mp4",
              caption: "🎬 Downloaded by *AzahraBot* ⚡",
            },
            { quoted: msg }
          );
        } else {
          await sock.sendMessage(
            from,
            {
              image: { url },
              caption: "🖼️ Downloaded by *AzahraBot* ⚡",
            },
            { quoted: msg }
          );
        }

        sentCount++;
        await new Promise((r) => setTimeout(r, 1200)); // ⏳ small delay
      } catch (err) {
        console.error("⚠️ Error sending media:", err.message);
      }
    }

    if (sentCount === 0) {
      await sock.sendMessage(from, { text: "⚠️ Couldn’t send media — try another link." }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
    }
  } catch (err) {
    console.error("❌ IG Downloader Error:", err.message);
    const errorMsg =
      err.code === "ECONNABORTED"
        ? "⏳ Request timed out. Try again later."
        : err.response?.status
        ? `HTTP ${err.response.status} — Instagram may be blocking requests.`
        : err.message;

    await sock.sendMessage(from, { text: `⚠️ Failed to download Instagram media.\n\nError: ${errorMsg}` }, { quoted: msg });
  }
};