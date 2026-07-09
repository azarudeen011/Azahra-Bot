const { requireRegistration } = require('../../lib/guards');

module.exports = async (sock, msg, from) => {
    const sender = msg.key.participant || msg.key.remoteJid;
    // Global guard in index.js handles requireRegistration

    const text = `
🎰 *WELCOME TO THE AZAHRA CASINO!* 🎰
━━━━━━━━━━━━━━━━━━━━━━
Are you ready to risk it all and become a billionaire? Or will you go totally bankrupt? 🤑 
Here is your ultimate guide to playing the most highly-addictive games in this bot!

💰 *1. THE BANK (Economy)*
Before you can play, you need cash!
*👉 \`.daily\`* — Claim your free $1,000 to $3,000 every *24 hours*. Don't forget this!
*👉 \`.balance\`* — Flex your wallet! Check your current balance, total wins, and total losses.

⚠️ *NOTICE:* All casino games have a *5-minute cooldown* to keep things fair!

*(For all games below, you can bet a specific amount like \`500\`, or type \`all\` to go ALL-IN!)*

⚠️ *COMMON CASINO ODDS & RULES (Applies to ALL games!)*
The casino uses a smart tier system. The higher you bet, the harder it gets to win!
- Bet < 50k  : 70% to 75% win chance
- Bet > 50k  : 65% win chance
- Bet > 100k : 50% to 55% win chance
- Bet > 500k : 45% to 50% win chance
- Bet > 1M   : 30% to 40% win chance
- Bet > 5M   : 15% to 30% win chance
- Bet > 10M  : 10% to 20% win chance
*Be smart and careful! The house always wins if you get too greedy.*

🎲 *2. FAST CASINO*
*👉 \`.casino <bet>\`* (Example: \`.casino 50000\`)
A fast-paced classic betting game!


🍒 *3. SLOT MACHINE (The Classic!)*
*👉 \`.slot <bet>\`* (Example: \`.slot 1000\`)
Watch the reels spin live! If they match, you win BIG!
🔥 *Jackpot:* 7️⃣7️⃣7️⃣ pays *35x* your bet!
💎 *Diamonds:* 💎💎💎 pays *20x*
🍒 *Cherries:* 🍒🍒🍒 pays *10x*
*(Even 2 matching symbols returns your bet!)*

🎡 *4. ROULETTE (The Big Wheel!)*
*👉 \`.roulette <color> <bet>\`* (Example: \`.roulette red 500\`)
Predict where the spinning ball will land!
🔴 *Red* or ⚫ *Black* — Safe bet. Doubles your money (2x).
🟢 *Green* — The ultimate risk! Only 1 number is green. If it hits, you win *35x* your bet!! 

🪙 *5. COINFLIP (50/50 Chance!)*
*👉 \`.coinflip <heads/tails> <bet>\`* (Example: \`.coinflip tails all\`)
No complex math. No strategies. Just pure 50/50 luck.
Guess right? You instantly double your cash (2x). Guess wrong? You lose it all.

🚀 *6. CRASH (The Crypto Game!)*
*👉 \`.crash <target_multiplier> <bet>\`* (Example: \`.crash 2.5 500\`)
A rocket 🚀 takes off and the multiplier climbs (*1.5x, 1.8x, 2.3x...*).
You must guess a safe target to cash out at before it explodes 💥!
*If you guess 2.5x:*
✅ The rocket reaches 2.6x... YOU WIN! You get exactly 2.5x your bet!
❌ The rocket blows up at 1.4x... YOU LOSE!

*💡 PRO TIP:* The bot actually animates the games in real-time by editing its messages! Play in a group for maximum hype!

💸 *7. TRANSFER MONEY*
*👉 \`.donate @user <amount>\`* (Example: \`.donate @user 500\`)
Send your hard-earned (or gambled!) cash to a friend. Use \`all\` to send everything!
*(Only works in groups — mention the person you want to pay!)*
`.trim();

    await sock.sendMessage(from, { text }, { quoted: msg });
};
