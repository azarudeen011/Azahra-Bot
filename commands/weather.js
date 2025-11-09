// =============================================
// 🌦️ Azahrabot Weather Command v2.1 (Clean Edition)
// Fast • Lightweight • No Banner • Auto Country Guess
// =============================================

const axios = require("axios");

const countryPrefixes = {
  91: "India", 1: "United States", 44: "United Kingdom",
  62: "Indonesia", 60: "Malaysia", 65: "Singapore",
  81: "Japan", 92: "Pakistan", 49: "Germany",
  39: "Italy", 33: "France", 34: "Spain", 55: "Brazil",
  971: "UAE", 234: "Nigeria", 7: "Russia", 94: "Sri Lanka"
};

module.exports = async (sock, msg, from, text, args = []) => {
  try {
    // React to command
    await sock.sendMessage(from, { react: { text: "🌦️", key: msg.key } });
  } catch {}

  try {
    const userNum = from.split("@")[0];
    const inputCity = args.join(" ").trim();

    // Detect country from number prefix
    const prefixMatch = Object.keys(countryPrefixes).find(code =>
      userNum.startsWith(code)
    );
    const guessedCountry = countryPrefixes[prefixMatch] || "India";
    const location = inputCity || guessedCountry;

    // Fetch weather data
    const url = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
    const { data } = await axios.get(url, { timeout: 10000 });
    const weather = data?.current_condition?.[0];

    if (!weather) throw new Error("Invalid response from weather API");

    const desc = weather.weatherDesc?.[0]?.value || "N/A";
    const feels = weather.FeelsLikeC || "N/A";
    const temp = weather.temp_C || "N/A";

    // 🧾 Clean Weather Report
    const weatherText = `
🌤️ *Weather Report — ${location}*
━━━━━━━━━━━━━━━━━━━
🌡️ *Temperature:* ${temp}°C
🤔 *Feels Like:* ${feels}°C
💧 *Humidity:* ${weather.humidity}%
🌬️ *Wind:* ${weather.windspeedKmph} km/h
🌞 *Visibility:* ${weather.visibility} km
🌈 *Condition:* ${desc}
📍 *Region:* ${guessedCountry}
────────────────────
☁️ _Powered by AzarTech Weather Engine_
    `.trim();

    // Send plain weather info (no banner or channel)
    await sock.sendMessage(from, { text: weatherText }, { quoted: msg });

  } catch (err) {
    console.error("⚠️ Weather command error:", err.message);
    await sock.sendMessage(from, {
      text: `❌ Unable to fetch weather data.\nTry again later or specify a city name.\n\nExample:\n.weather Tokyo`
    }, { quoted: msg });
  }
};
