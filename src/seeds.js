import { readFileSync } from "node:fs";
import { db } from "./db.js";

const rules = [
  ["conversation", /thoughts|random thoughts|relatable|unfiltered|opinions|tweets|vibes|here/i],
  ["creative", /artist|art |writer|writing|scribe|sewist|fashion|graphic designer|creative director|music director/i],
  ["music", /music|musician|stonebwoy|army|lingorm/i],
  ["football", /chelsea|manchester united|manutd|real madrid|halamadrid|barcelona|football/i],
  ["technology", /developer|software|product manager|builder|startup|technology|tech bro|computer science|ui\/ux/i],
  ["education", /student|education|law|llb|medical|pharm|university|learning|learner/i],
  ["books", /book|reading|writing/i],
  ["faith", /god|jesus|prayer|faith/i],
  ["lifestyle", /lifestyle|model|travel|curious|improvement|self/i]
];

export function inferInterests(bio = "") {
  return rules.filter(([, pattern]) => pattern.test(bio)).map(([tag]) => tag);
}

export function importSeeds(filePath) {
  const data = JSON.parse(readFileSync(filePath, "utf8"));
  if (!Array.isArray(data.accounts)) throw new Error("Seed file must contain an accounts array.");
  const upsert = db.prepare(`
    INSERT INTO seed_accounts (username, display_name, followers, bio, interests, source)
    VALUES (@username, @display_name, @followers, @bio, @interests, @source)
    ON CONFLICT(username) DO UPDATE SET
      display_name=excluded.display_name, followers=excluded.followers,
      bio=excluded.bio, interests=excluded.interests
  `);
  const tx = db.transaction((rows) => {
    let count = 0;
    for (const row of rows) {
      const username = String(row.username || "").replace(/^@/, "").trim();
      if (!/^[A-Za-z0-9_]{1,15}$/.test(username)) continue;
      const bio = String(row.bio || "").slice(0, 500);
      upsert.run({
        username,
        display_name: String(row.display_name || "").slice(0, 100),
        followers: Math.max(0, Number(row.followers) || 0),
        bio,
        interests: inferInterests(bio).join(","),
        source: "user-provided"
      });
      count++;
    }
    return count;
  });
  return tx(data.accounts);
}

export function seedSummary() {
  const rows = db.prepare("SELECT interests FROM seed_accounts").all();
  const counts = new Map();
  for (const row of rows) {
    for (const tag of row.interests.split(",").filter(Boolean)) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return [...counts.entries()].sort((a,b) => b[1]-a[1]);
}

export function seedSearches() {
  const tags = seedSummary().slice(0, 7).map(([tag]) => tag);
  const topicTerms = {
    conversation: '("random thoughts" OR relatable OR opinions OR "everyday thoughts")',
    creative: '(artist OR writer OR fashion OR designer OR creative)',
    music: '(music OR musician OR afrobeats)',
    football: '(football OR Chelsea OR "Manchester United" OR "Real Madrid")',
    technology: '(developer OR startup OR "product manager" OR robotics)',
    education: '(student OR learning OR university OR education)',
    books: '(books OR reading OR writing)',
    faith: '(faith OR God OR Christian)',
    lifestyle: '(lifestyle OR curious OR "self improvement")'
  };
  const terms = tags.map(tag => topicTerms[tag]).filter(Boolean);
  const topicQuery = terms.length ? `(${terms.slice(0, 4).join(" OR ")})` : "(conversation OR creativity OR technology)";
  const query = `(Ghana OR Ghanaian OR Accra) ${topicQuery}`;
  return `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
}
