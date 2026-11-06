import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { db, closeDb } from "./db.js";
import { importAccounts } from "./import.js";

const args = process.argv.slice(2);
const command = args[0] || "help";

function printHelp() {
  console.log(`
GhanaConnect — terminal account discovery assistant

Commands:
  npm start                         Show help
  npm run import -- ./accounts.json Import candidate accounts
  npm run recommendations           Show top recommendations
  npm run stats                     Show local database statistics
  npm run discover                  Check discovery provider setup

Account review:
  node src/cli.js mark <username> <reviewed|followed|skipped>
  node src/cli.js open <username>

Note: discovery providers are not configured in this first version.
Import only data collected through permitted sources.
`);
}

function recommendations() {
  const rows = db.prepare(`
    SELECT username, display_name, country, followers, posts_7d,
           replies_7d, score, status
    FROM accounts
    WHERE status = 'new'
    ORDER BY score DESC, followers ASC
    LIMIT 30
  `).all();

  if (!rows.length) {
    console.log("No recommendations yet. Import an accounts JSON file first.");
    return;
  }

  console.log("\nTOP ACCOUNT RECOMMENDATIONS\n");
  for (const [i, row] of rows.entries()) {
    console.log(
      `${String(i + 1).padStart(2, "0")}. @${row.username} — ${row.country}\n` +
      `    ${row.display_name || "No display name"} | ${row.followers} followers | ${row.posts_7d} posts/7d | ${row.replies_7d} replies/7d | score ${row.score}/100\n` +
      `    https://x.com/${row.username}\n`
    );
  }
}

function stats() {
  const total = db.prepare("SELECT COUNT(*) AS n FROM accounts").get().n;
  const statuses = db.prepare("SELECT status, COUNT(*) AS n FROM accounts GROUP BY status").all();
  const countries = db.prepare("SELECT country, COUNT(*) AS n FROM accounts GROUP BY country ORDER BY n DESC").all();

  console.log("\nGHANACONNECT STATS");
  console.log(`Total accounts: ${total}`);
  console.log("\nBy status:");
  for (const row of statuses) console.log(`  ${row.status}: ${row.n}`);
  console.log("\nBy location:");
  for (const row of countries) console.log(`  ${row.country}: ${row.n}`);
}

function mark(username, status) {
  if (!username || !["reviewed", "followed", "skipped"].includes(status)) {
    throw new Error("Usage: node src/cli.js mark <username> <reviewed|followed|skipped>");
  }
  const result = db.prepare(
    "UPDATE accounts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ? COLLATE NOCASE"
  ).run(status, username.replace(/^@/, ""));
  console.log(result.changes ? `@ ${username} marked ${status}.` : `Account @${username} was not found.`);
}

function openProfile(username) {
  if (!username) throw new Error("Usage: node src/cli.js open <username>");
  const clean = username.replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(clean)) throw new Error("Invalid X username.");
  const url = `https://x.com/${clean}`;
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const commandArgs = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  spawn(command, commandArgs, { detached: true, stdio: "ignore" }).unref();
  console.log(`Opening ${url}`);
}

try {
  switch (command) {
    case "help":
      printHelp();
      break;
    case "discover":
      console.log("Discovery provider: not configured.");
      console.log("This MVP does not scrape X or automate follows.");
      console.log("Import candidates from a permitted data source with: npm run import -- ./accounts.json");
      break;
    case "recommendations":
      recommendations();
      break;
    case "stats":
      stats();
      break;
    case "import": {
      const file = args[1];
      if (!file || !existsSync(resolve(file))) throw new Error("Provide an existing JSON file: npm run import -- ./accounts.json");
      console.log(`Imported or updated ${importAccounts(resolve(file))} eligible accounts.`);
      break;
    }
    case "mark":
      mark(args[1], args[2]);
      break;
    case "open":
      openProfile(args[1]);
      break;
    default:
      printHelp();
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
} finally {
  closeDb();
}
