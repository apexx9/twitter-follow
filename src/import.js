import { readFileSync } from "node:fs";
import { db } from "./db.js";
import { scoreAccount } from "./scoring.js";

const allowedCountries = new Set(["Ghana", "Nigeria", "Other Africa", "International", "Unknown"]);
const allowedSegments = new Set([
  "ghana_conversations",
  "ghana_creative",
  "ghana_sports_music",
  "ghana_students_builders",
  "nigeria_communities",
  "african_technology",
  "wider_interests"
]);

export function importAccounts(filePath) {
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("Import file must contain a JSON array.");

  const insert = db.prepare(`
    INSERT INTO accounts
      (username, profile_url, display_name, country, segment, followers, following,
       posts_7d, replies_7d, likes_7d, bio, tags, score, source)
    VALUES
      (@username, @profile_url, @display_name, @country, @segment, @followers, @following,
       @posts_7d, @replies_7d, @likes_7d, @bio, @tags, @score, @source)
    ON CONFLICT(username) DO UPDATE SET
      profile_url=excluded.profile_url,
      display_name=excluded.display_name,
      country=excluded.country,
      segment=excluded.segment,
      followers=excluded.followers,
      following=excluded.following,
      posts_7d=excluded.posts_7d,
      replies_7d=excluded.replies_7d,
      likes_7d=excluded.likes_7d,
      bio=excluded.bio,
      tags=excluded.tags,
      score=excluded.score,
      updated_at=CURRENT_TIMESTAMP
  `);

  let imported = 0;
  const run = db.transaction((rows) => {
    for (const row of rows) {
      const username = String(row.username || "").replace(/^@/, "").trim();
      if (!/^[A-Za-z0-9_]{1,15}$/.test(username)) continue;

      const country = allowedCountries.has(row.country) ? row.country : "Unknown";
      const segment = allowedSegments.has(row.segment) ? row.segment : "other";
      const account = {
        username,
        profile_url: `https://x.com/${username}`,
        display_name: String(row.display_name || "").slice(0, 100),
        country,
        segment,
        followers: Math.max(0, Number(row.followers) || 0),
        following: row.following === undefined || row.following === null || row.following === "" ? null : Math.max(0, Number(row.following) || 0),
        posts_7d: row.posts_7d === undefined || row.posts_7d === null || row.posts_7d === "" ? null : Math.max(0, Number(row.posts_7d) || 0),
        replies_7d: row.replies_7d === undefined || row.replies_7d === null || row.replies_7d === "" ? null : Math.max(0, Number(row.replies_7d) || 0),
        likes_7d: row.likes_7d === undefined || row.likes_7d === null || row.likes_7d === "" ? null : Math.max(0, Number(row.likes_7d) || 0),
        bio: String(row.bio || "").slice(0, 500),
        tags: Array.isArray(row.tags) ? row.tags.join(",") : String(row.tags || ""),
        source: String(row.source || "manual-import")
      };

      if (account.followers < 100 || account.followers > 2000) continue;
      account.score = scoreAccount(account);
      insert.run(account);
      imported++;
    }
  });

  run(parsed);
  return imported;
}
