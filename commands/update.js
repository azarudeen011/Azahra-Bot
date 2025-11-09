// ===============================================================
// 🔄 Azahrabot Auto-Updater v4.7
// Safe for Panels • Git + ZIP Support • Preserves Owner Session
// Adds Channel Banner • Works on Replit, VPS, bot.hosting.net
// ===============================================================

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const settings = require("../settings");

// 🧠 Run shell commands
function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err)
        return reject(
          new Error((stderr || stdout || err.message || "").toString())
        );
      resolve((stdout || "").toString());
    });
  });
}

// 🔍 Check for .git repository (VPS users)
async function hasGitRepo() {
  const gitDir = path.join(process.cwd(), ".git");
  if (!fs.existsSync(gitDir)) return false;
  try {
    await run("git --version");
    return true;
  } catch {
    return false;
  }
}

// ⚙️ Update via Git (for VPS/CLI users)
async function updateViaGit() {
  const oldRev = (await run("git rev-parse HEAD").catch(() => "unknown")).trim();
  await run("git fetch --all --prune");
  const newRev = (await run("git rev-parse origin/main")).trim();
  const alreadyUpToDate = oldRev === newRev;

  let commits = "";
  let files = "";
  if (!alreadyUpToDate) {
    commits = (
      await run(
        `git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`
      ).catch(() => "")
    ).trim();
    files = (
      await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => "")
    ).trim();
    await run(`git reset --hard ${newRev}`);
    await run("git clean -fd");
  }

  return { oldRev, newRev, alreadyUpToDate, commits, files };
}

// 🌐 Download ZIP safely (fallback for Replit/panel users)
function downloadFile(url, dest, visited = new Set()) {
  return new Promise((resolve, reject) => {
    try {
      if (visited.has(url) || visited.size > 8)
        return reject(new Error("Too many redirects"));
      visited.add(url);

      const client = url.startsWith("https://") ? require("https") : require("http");
      const req = client.get(
        url,
        { headers: { "User-Agent": "AzahraBot-Updater/1.0", Accept: "*/*" } },
        (res) => {
          if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
            const location = res.headers.location;
            if (!location)
              return reject(
                new Error(`HTTP ${res.statusCode} without Location header`)
              );
            const nextUrl = new URL(location, url).toString();
            res.resume();
            return downloadFile(nextUrl, dest, visited)
              .then(resolve)
              .catch(reject);
          }

          if (res.statusCode !== 200)
            return reject(new Error(`HTTP ${res.statusCode}`));

          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on("finish", () => file.close(resolve));
          file.on("error", (err) => {
            try {
              file.close(() => {});
            } catch {}
            fs.unlink(dest, () => reject(err));
          });
        }
      );

      req.on("error", (err) => fs.unlink(dest, () => reject(err)));
    } catch (e) {
      reject(e);
    }
  });
}

// 📦 Extract ZIP using available system tool
async function extractZip(zipPath, outDir) {
  if (process.platform === "win32") {
    const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(
      /\\/g,
      "/"
    )}' -Force"`;
    await run(cmd);
    return;
  }

  try {
    await run("command -v unzip");
    await run(`unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  try {
    await run("command -v 7z");
    await run(`7z x -y '${zipPath}' -o'${outDir}'`);
    return;
  } catch {}
  try {
    await run("busybox unzip -h");
    await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  throw new Error("No unzip tool found (unzip/7z/busybox). Git mode is recommended.");
}

// 🗂 Copy files recursively with ignore list
function copyRecursive(src, dest, ignore = [], relative = "", outList = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (ignore.includes(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d, ignore, path.join(relative, entry), outList);
    } else {
      fs.copyFileSync(s, d);
      if (outList)
        outList.push(path.join(relative, entry).replace(/\\/g, "/"));
    }
  }
}

// 📁 Update via GitHub ZIP (panel/replit default)
async function updateViaZip(zipUrl, cwd) {
  if (!zipUrl) throw new Error("No ZIP URL provided (check settings.js)");
  const tmpDir = path.join(cwd, "tmp_update");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const zipPath = path.join(tmpDir, "update.zip");
  await downloadFile(zipUrl, zipPath);

  const extractTo = path.join(tmpDir, "extracted");
  if (fs.existsSync(extractTo))
    fs.rmSync(extractTo, { recursive: true, force: true });

  await extractZip(zipPath, extractTo);

  // Detect GitHub root folder (e.g., repo-main)
  let srcRoot = extractTo;
  const items = fs.readdirSync(extractTo).map((n) => path.join(extractTo, n));
  if (
    items.length === 1 &&
    fs.existsSync(items[0]) &&
    fs.lstatSync(items[0]).isDirectory()
  )
    srcRoot = items[0];

  const ignore = [
    "node_modules",
    ".git",
    ".env",
    "auth_info",
    "auth_info/",
    "auth_info/*",
    "tmp",
    "tmp_update",
    "data",
    ".replit",
    ".local",
    "baileys_store.json",
    "package-lock.json",
  ];

  const copied = [];
  copyRecursive(srcRoot, cwd, ignore, "", copied);

  // Cleanup temp
  try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
  try { fs.rmSync(zipPath, { force: true }); } catch {}
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

  // optional: clean npm cache
  await run("npm cache clean --force").catch(() => {});

  return { copiedFiles: copied };
}

// ♻️ Restart after update
async function restartProcess(sock, chatId, message) {
  try {
    await sock.sendMessage(chatId, {
      text: "✅ Update complete! Restarting…",
      contextInfo: {
        externalAdReply: {
          title: "Azahrabot — Update Complete 🚀",
          body: "Your bot is now up to date!",
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnailUrl: "https://res.cloudinary.com/ds1lpf36n/image/upload/v1762079835/satoru-gojo-black-3840x2160-14684_1_amj5ys.png",
          sourceUrl: "https://whatsapp.com/channel/0029VbBF0t8J93wQxPYwla2v"
        }
      }
    }, { quoted: message });
  } catch {}
  try {
    await run("pm2 restart all");
    return;
  } catch {}
  setTimeout(() => process.exit(0), 500);
}

// ===============================================================
// 🧩 MAIN COMMAND HANDLER
// ===============================================================
module.exports = async (sock, msg, from, body, args = []) => {
  const sender = msg.key?.participant || msg.key?.remoteJid || "unknown";
  const ownerNumber = (settings.ownerNumber || "").replace(/[^0-9+]/g, "");
  const senderIsOwner =
    msg.key.fromMe || (ownerNumber && sender.includes(ownerNumber));

  if (!senderIsOwner) {
    await sock.sendMessage(
      from,
      { text: "❌ Only the bot owner can run .update" },
      { quoted: msg }
    );
    return;
  }

  try {
    await sock.sendMessage(
      from,
      { text: "🔄 Checking for updates… please wait ⏳" },
      { quoted: msg }
    );

    const cwd = process.cwd();

    if (await hasGitRepo()) {
      try {
        const { oldRev, newRev, alreadyUpToDate } = await updateViaGit();
        const summary = alreadyUpToDate
          ? `✅ Already up to date: ${newRev}`
          : `✅ Updated to ${newRev}`;
        await run("npm install --no-audit --no-fund").catch(() => {});
        await sock.sendMessage(
          from,
          {
            text: `${summary}\n\n🚀 Restarting Azahrabot...`,
            contextInfo: {
              externalAdReply: {
                title: "Azahrabot — Update Success 💫",
                body: "Smooth, secure, and latest version!",
                mediaType: 1,
                renderLargerThumbnail: true,
                thumbnailUrl: "https://res.cloudinary.com/ds1lpf36n/image/upload/v1762079835/satoru-gojo-black-3840x2160-14684_1_amj5ys.png",
                sourceUrl: "https://whatsapp.com/channel/0029VbBF0t8J93wQxPYwla2v"
              }
            }
          },
          { quoted: msg }
        );
        await restartProcess(sock, from, msg);
        return;
      } catch (e) {
        console.error("Git update failed:", e);
      }
    }

    // ZIP fallback
    const zipUrl =
      settings.updateZipUrl || process.env.UPDATE_ZIP_URL || "";
    if (!zipUrl) {
      await sock.sendMessage(
        from,
        { text: "❌ Update URL not found in settings.js." },
        { quoted: msg }
      );
      return;
    }

    const result = await updateViaZip(zipUrl, cwd);
    await run("npm install --no-audit --no-fund").catch(() => {});

    await sock.sendMessage(from, {
      text: `✅ *Update Completed Successfully!*
📦 Files Updated: ${result.copiedFiles.length || 0}
🔁 Restarting Azahrabot...`,
      contextInfo: {
        externalAdReply: {
          title: "🚀 Azahrabot Auto-Updater",
          body: "Keep your bot fresh & stable.",
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnailUrl: "https://res.cloudinary.com/ds1lpf36n/image/upload/v1762079835/satoru-gojo-black-3840x2160-14684_1_amj5ys.png",
          sourceUrl: "https://whatsapp.com/channel/0029VbBF0t8J93wQxPYwla2v"
        }
      }
    }, { quoted: msg });

    await restartProcess(sock, from, msg);
  } catch (err) {
    console.error("Update failed:", err);
    await sock.sendMessage(
      from,
      { text: `❌ Update failed:\n${String(err.message || err)}` },
      { quoted: msg }
    );
  }
};
