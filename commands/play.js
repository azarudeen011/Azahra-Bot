// ==============================================
// 🎵 Azahrabot Play Command (v5.4 Clean & Unified)
// Single Message: Song Info + MP3 Download
// ==============================================

const axios = require("axios");
const yts = require("yt-search");
const small = require("../lib/small_lib");

module.exports = async (sock, msg, from, text, args) => {
  const query = args.join(" ").trim();

  if (!query) {
    return await sock.sendMessage(
      from,
      {
        text: "🎧 *Usage:* .play <song name>\n\nExample:\n.play perfect ed sheeran",
      },
      { quoted: msg }
    );
  }

  try {
    await sock.sendMessage(from, { react: { text: "🎶", key: msg.key } }).catch(() => {});
    await sock.sendMessage(from, { text: "🔍 *Searching for your song...*" }, { quoted: msg });

    // 🔍 Search song on YouTube
    const search = await yts(query);
    const video = search.videos[0];
    if (!video)
      return await sock.sendMessage(from, { text: "❌ No song found. Try another title!" }, { quoted: msg });

    const { title, timestamp, views, url, author, thumbnail } = video;

    // 🎶 Get MP3 link from API
    const apiBase = small.api.xyro || "https://api.xyro.site";
    const apiUrl = `${apiBase}/download/youtubemp3?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl, { timeout: 20000 });

    // Extract valid MP3 URL
    let downloadUrl =
      typeof data === "string"
        ? data
        : data?.download ||
          data?.url ||
          data?.download_url ||
          data?.result?.download ||
          null;

    if (!downloadUrl || !downloadUrl.startsWith("http")) {
      console.log("⚠️ API raw response:", data);
      return await sock.sendMessage(from, { text: "⚠️ Could not retrieve a valid MP3 link." }, { quoted: msg });
    }

    // 🧾 Build song info caption
    const caption = `
🎧 *${title}*
────────────────────
🎤 *Artist:* ${author.name}
⏱ *Duration:* ${timestamp}
👁 *Views:* ${views.toLocaleString()}
────────────────────
> 🎶 *Powered by ${small.author} Music Engine* ⚡
    `.trim();

    // 🎧 Send song info + mp3 (one single message)
    await sock.sendMessage(
      from,
      {
        audio: { url: downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        caption,
        contextInfo: {
          externalAdReply: {
            title,
            body: `${author.name} • ${timestamp}`,
            mediaType: 1,
            renderLargerThumbnail: true,
            thumbnailUrl: thumbnail,
            sourceUrl: url,
          },
        },
      },
      { quoted: msg }
    );

    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
  } catch (err) {
    console.error("❌ .play error:", err.message);
    await sock.sendMessage(
      from,
      { text: `⚠️ Failed to process song.\n\nError: ${err.message}` },
      { quoted: msg }
    );
  }
};
