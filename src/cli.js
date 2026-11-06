import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { db, closeDb } from "./db.js";
import { importAccounts } from "./import.js";
import { scoreAccount } from "./scoring.js";
import { config } from "../config.js";
import { getSearches, segments } from "./searches.js";
import { importSeeds, seedSummary, seedSearches } from "./seeds.js";

const args = process.argv.slice(2);
const command = args[0] || "help";

function printHelp() {
  console.log(`
GhanaConnect — terminal account discovery assistant

Commands:
  pnpm start                              Show help
  pnpm discover [segment]                 Generate targeted X search links
  pnpm run seed-import -- ./seed-accounts.json  Import your private seed list
  pnpm run seed-summary                   Show interests found in your following
  pnpm run add                                 Add an account interactively
  pnpm run import -- ./accounts.json      Import candidate accounts
  pnpm recommendations                    Show top recommendations
  pnpm stats                              Show local database statistics

Account review:
  node src/cli.js mark <username> <reviewed|followed|skipped>
  node src/cli.js open <username>

Search groups:
  ghana_conversations, ghana_creative, ghana_sports_music,
  ghana_students_builders, nigeria_communities,
  african_technology, wider_interests

Discovery opens public X search pages. You review profiles and add candidates;
GhanaConnect does not scrape X or automate follows.
`);
}

function discover(segment) {
  const selected = segment ? [segment] : Object.keys(segments);
  for (const key of selected) {
    if (!segments[key]) {
      console.log(`Unknown segment: ${key}\nAvailable: ${Object.keys(segments).join(", ")}`);
      process.exitCode = 1;
      return;
    }
    console.log(`\n=== ${segments[key].label} ===`);
    for (const search of getSearches(key)) {
      console.log(`\n${search.label}\n${search.url}`);
    }
  }
  console.log("\nOpen a search link, inspect profiles yourself, then run pnpm run add to save a candidate.");
}

async function addAccount() {
  const rl = createInterface({ input, output });
  const ask = async (label, fallback = "") => {
    const value = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ""}: `)).trim();
    return value || fallback;
  };
  try {
    console.log("\nADD A CANDIDATE");
    console.log("Only enter details visible on the profile. Unknown information can stay blank.");
    const username = (await ask("X username (without @)")).replace(/^@/, "");
    if (!/^[A-Za-z0-9_]{1,15}$/.test(username)) throw new Error("Invalid X username.");

    const existing = db.prepare("SELECT username FROM accounts WHERE username = ? COLLATE NOCASE").get(username);
    if (existing) throw new Error(`@${username} is already in your database.`);

    const followersInput = await ask("Followers");
    const followers = followersInput ? Number(followersInput.replace(/[,\s]/g, "")) : 0;
    if (!Number.isFinite(followers) || followers < 100 || followers > 2000) {
      throw new Error("Enter a verified follower count between 100 and 2,000.");
    }

    console.log("\nCountries: Ghana, Nigeria, Other Africa, International, Unknown");
    const country = await ask("Country", "Unknown");
    if (!["Ghana", "Nigeria", "Other Africa", "International", "Unknown"].includes(country)) {
      throw new Error("Invalid country value.");
    }

    const segmentKeys = Object.keys(segments);
    console.log(`\nDiscovery groups: ${segmentKeys.join(", ")}`);
    const segment = await ask("Best matching group", "wider_interests");
    if (!segments[segment]) throw new Error("Invalid discovery group.");

    const display_name = await ask("Display name");
    const bio = await ask("Bio");
    const account = {
      username, display_name, country, segment, followers,
      following: null, posts_7d: null, replies_7d: null, likes_7d: null, bio
    };
    const score = scoreAccount(account);
    db.prepare(`
      INSERT INTO accounts
        (username, profile_url, display_name, country, segment, followers, following,
         posts_7d, replies_7d, likes_7d, bio, tags, score, source)
      VALUES
        (@username, @profile_url, @display_name, @country, @segment, @followers, @following,
         @posts_7d, @replies_7d, @likes_7d, @bio, '', @score, 'manual-review')
    `).run({ ...account, profile_url: `https://x.com/${username}`, score });
    console.log(`\nSaved @${username} — provisional profile score ${score}/100.`);
    console.log("Activity metrics were left unknown, not assumed to be zero.");
  } finally {
    rl.close();
  }
}

function recommendations() {
  const rows = db.prepare(`
    SELECT username, display_name, country, segment, followers, posts_7d,
           replies_7d, score, status
    FROM accounts
    WHERE status = 'new'
    ORDER BY score DESC, followers ASC
    LIMIT 30
  `).all();

  if (!rows.length) {
    console.log("No recommendations yet. Discover and add some candidates first.");
    return;
  }

  console.log("\nTOP ACCOUNT RECOMMENDATIONS\n");
  for (const [i, row] of rows.entries()) {
    console.log(
      `${String(i + 1).padStart(2, "0")}. @${row.username} — ${row.country} / ${row.segment}\n` +
      `    ${row.display_name || "No display name"} | ${row.followers} followers | ${row.posts_7d ?? "not recorded"} posts/7d | ${row.replies_7d ?? "not recorded"} replies/7d | profile score ${row.score}/100\n` +
      `    https://x.com/${row.username}\n`
    );
  }
}

function stats() {
  const total = db.prepare("SELECT COUNT(*) AS n FROM accounts").get().n;
  const statuses = db.prepare("SELECT status, COUNT(*) AS n FROM accounts GROUP BY status").all();
  const countries = db.prepare("SELECT country, COUNT(*) AS n FROM accounts GROUP BY country ORDER BY n DESC").all();
  const segmentRows = db.prepare("SELECT segment, COUNT(*) AS n FROM accounts GROUP BY segment ORDER BY n DESC").all();

  console.log("\nGHANACONNECT STATS");
  console.log(`Total accounts: ${total}`);
  console.log("\nBy status:");
  for (const row of statuses) console.log(`  ${row.status}: ${row.n}`);
  console.log("\nBy location:");
  for (const row of countries) console.log(`  ${row.country}: ${row.n}`);
  console.log("\nBy audience segment:");
  for (const row of segmentRows) console.log(`  ${row.segment}: ${row.n}`);
  console.log("\nDiscovery focus mix:");
  for (const [segment, percentage] of Object.entries(config.discoveryFocus)) {
    console.log(`  ${segment}: ${percentage}%`);
  }
}

function mark(username, status) {
  if (!username || !["reviewed", "followed", "skipped"].includes(status)) {
    throw new Error("Usage: node src/cli.js mark <username> <reviewed|followed|skipped>");
  }
  const result = db.prepare(
    "UPDATE accounts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ? COLLATE NOCASE"
  ).run(status, username.replace(/^@/, ""));
  console.log(result.changes ? `@${username} marked ${status}.` : `Account @${username} was not found.`);
}

function openProfile(username) {
  if (!username) throw new Error("Usage: node src/cli.js open <username>");
  const clean = username.replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(clean)) throw new Error("Invalid X username.");
  const url = `https://x.com/${clean}`;
  const openCommand = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const commandArgs = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  spawn(openCommand, commandArgs, { detached: true, stdio: "ignore" }).unref();
  console.log(`Opening ${url}`);
}

try {
  switch (command) {
    case "help": printHelp(); break;
    case "discover": discover(args[1]); break;
    case "seed-import": {
      const file = args[1];
      if (!file || !existsSync(resolve(file))) throw new Error("Provide a seed JSON file: pnpm run seed-import -- ./seed-accounts.json");
      console.log(`Imported or updated ${importSeeds(resolve(file))} seed profiles.`);
      break;
    }
    case "seed-summary": {
      const rows = seedSummary();
      console.log("\nINTERESTS IN YOUR FOLLOWING LIST\n");
      for (const [tag, count] of rows) console.log(`  ${tag}: ${count} profiles`);
      console.log("\nPersonalised Ghana search:\n" + seedSearches() + "\n");
      break;
    }
    case "add": await addAccount(); break;
    case "recommendations": recommendations(); break;
    case "stats": stats(); break;
    case "import": {
      const file = args[1];
      if (!file || !existsSync(resolve(file))) throw new Error("Provide an existing JSON file: pnpm run import -- ./accounts.json");
      console.log(`Imported or updated ${importAccounts(resolve(file))} eligible accounts.`);
      break;
    }
    case "mark": mark(args[1], args[2]); break;
    case "open": openProfile(args[1]); break;
    default: printHelp();
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
} finally {
  closeDb();
}
