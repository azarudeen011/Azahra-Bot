const firebaseManager = require("../../lib/firebaseManager");
const identityManager = require("../../lib/identityManager");
const { requireRegistration } = require("../../lib/guards");
const cardData = require("../../lib/cardData");
const axios = require("axios");

// Max limits per tier
const TIER_MAX_PRICES = {
    "1": 100000,
    "2": 200000,
    "3": 300000,
    "4": 400000,
    "5": 600000,
    "6": 800000,
    "S": 1000000,
    "X": 2000000
};

module.exports = async function (sock, msg, from, text, args) {
    const senderJid = msg.key.participant || msg.key.remoteJid;
    if (!(await requireRegistration(sock, from, senderJid, msg))) return;

    // -------------------------------------------------------------------------
    // ℹ️ INFO SUB-COMMAND
    // -------------------------------------------------------------------------
    if (args[0]?.toLowerCase() === 'info') {
        let info = `🛒 *SELLC COMMAND INFO* 🛒\n`;
        info += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        info += `*Usage:* \`.sellc <index> <price>\`\n`;
        info += `*Example:* \`.sellc 1 250000\`\n\n`;
        info += `💰 *Max Selling Prices per Tier:*\n`;
        info += `• Tier 1: $100,000\n`;
        info += `• Tier 2: $200,000\n`;
        info += `• Tier 3: $300,000\n`;
        info += `• Tier 4: $400,000\n`;
        info += `• Tier 5: $600,000\n`;
        info += `• Tier 6: $800,000\n`;
        info += `• Tier S (Special): $1,000,000\n`;
        info += `• Tier X (Ultimate): $2,000,000\n\n`;
        info += `_Note: Use \`.col\` to find your card indexes!_`;

        return sock.sendMessage(from, { text: info }, { quoted: msg });
    }

    if (args.length < 2) {
        return sock.sendMessage(from, { text: "❌ Invalid format.\nUsage: `.sellc <card_index> <price>`\nExample: `.sellc 1 250000`\nType `.sellc info` for tier limits." }, { quoted: msg });
    }

    const phoneNumber = identityManager.resolveNumber(senderJid);
    const user = await firebaseManager.fetchUser(phoneNumber);
    if (!user) return;

    const cardIndexStr = args[0];
    const priceStr = args[1];

    const indexVal = parseInt(cardIndexStr);
    const price = parseInt(priceStr);

    if (isNaN(indexVal) || indexVal <= 0) {
        return sock.sendMessage(from, { text: "❌ Invalid card index. Use `.col` to see your card indexes." }, { quoted: msg });
    }

    if (isNaN(price) || price <= 0) {
        return sock.sendMessage(from, { text: "❌ Invalid price. Must be a positive number." }, { quoted: msg });
    }

    const userCards = user.cards || {};

    // 1. Resolve card IDs alphabetically (CRITICAL: Must match .col order)
    const sortedCardIds = Object.keys(userCards).filter(id => userCards[id] > 0).sort();

    if (sortedCardIds.length === 0) {
        return sock.sendMessage(from, { text: "❌ You don't have any cards to sell!" }, { quoted: msg });
    }

    const targetIndex = indexVal - 1;
    if (targetIndex < 0 || targetIndex >= sortedCardIds.length) {
        return sock.sendMessage(from, { text: `❌ Card index ${indexVal} does not exist. You have ${sortedCardIds.length} cards in your \`.col\`.` }, { quoted: msg });
    }

    const cardId = sortedCardIds[targetIndex];

    // 2. Fetch Card Metadata
    const cardMeta = cardData.find(c => c.id === cardId);
    if (!cardMeta) {
        return sock.sendMessage(from, { text: "❌ Error: Could not find metadata for this card ID." }, { quoted: msg });
    }

    // 3. Validate Tier and Price
    const tierRaw = cardMeta.tier || "T1";
    const tierKey = tierRaw.replace("T", ""); // "1", "2", "S", "X" etc
    const maxPrice = TIER_MAX_PRICES[tierKey] || 50000;
    const currency = new Intl.NumberFormat('en-US');

    if (price > maxPrice) {
        return sock.sendMessage(from, { text: `❌ Price too high! The maximum allowed price for a Tier ${tierKey} card is ${currency.format(maxPrice)} coins.\nType \`.sellc info\` for all limits.` }, { quoted: msg });
    }

    // 4. Prepare Marketplace Listing
    const listingId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const listingData = {
        sellerPhone: phoneNumber,
        sellerName: user.name || "AzahraVerse Citizen",
        cardId: cardId,
        cardName: cardMeta.name || cardId,
        tier: tierKey,
        price: price,
        listedAt: Date.now()
    };

    // 5. Update User Inventory
    const updatedCards = { ...userCards };
    if (updatedCards[cardId] > 1) {
        updatedCards[cardId] -= 1;
    } else {
        delete updatedCards[cardId];
    }

    // 6. Save to Firebase
    try {
        // 1. Remove card from user inventory atomically
        await firebaseManager.removeCard(phoneNumber, cardId);

        // 2. Add to marketplace node
        const BASE_URL = process.env.FIREBASE_URL || "https://azahrabot-default-rtdb.firebaseio.com";
        await axios.put(`${BASE_URL}/marketplace/${listingId}.json`, listingData);

        const currency = new Intl.NumberFormat('en-US');
        const successMsg = `🛒 *CARD LISTED ON MARKETPLACE* 🛒\n\n` +
            `🎴 *Card:* ${listingData.cardName}\n` +
            `⭐ *Tier:* ${tierKey}\n` +
            `💰 *Listed Price:* ${currency.format(price)} coins\n\n` +
            `_Your card is now visible to all players in the AzahraVerse shop!_`;

        await sock.sendMessage(from, { text: successMsg }, { quoted: msg });
    } catch (error) {
        console.error("SellC Error:", error);
        await sock.sendMessage(from, { text: "❌ Failed to list the card. Please try again later." }, { quoted: msg });
    }
};

