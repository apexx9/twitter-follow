import { config } from "../config.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function scoreAccount(account) {
  const posts = Number(account.posts_7d || 0);
  const replies = Number(account.replies_7d || 0);
  const likes = Number(account.likes_7d || 0);
  const followers = Number(account.followers || 0);
  const bio = String(account.bio || "").trim();

  const activity = clamp(posts / 7, 0, 1) * 100;
  const conversation = clamp(replies / Math.max(posts, 1), 0, 1) * 100;
  const engagementRate = (replies + likes) / Math.max(followers, 1);
  const engagement = clamp(engagementRate / 0.15, 0, 1) * 100;
  const locationRank = config.locationPriority[account.country] ?? config.locationPriority.Unknown;
  const location = ((5 - locationRank) / 4) * 100;
  const profileCompleteness = bio.length >= 40 ? 100 : bio.length > 0 ? 50 : 0;

  const w = config.weights;
  const total = w.activity + w.conversation + w.engagement + w.location + w.profileCompleteness;
  return Number((
    (activity * w.activity +
      conversation * w.conversation +
      engagement * w.engagement +
      location * w.location +
      profileCompleteness * w.profileCompleteness) / total
  ).toFixed(1));
}
