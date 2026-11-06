import { config } from "../config.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function scoreAccount(account) {
  const followers = Number(account.followers || 0);
  const bio = String(account.bio || "").trim();
  const locationRank = config.locationPriority[account.country] ?? config.locationPriority.Unknown;
  const location = ((5 - locationRank) / 4) * 100;
  const profileCompleteness = bio.length >= 40 ? 100 : bio.length > 0 ? 50 : 0;

  const parts = [
    { value: location, weight: config.weights.location },
    { value: profileCompleteness, weight: config.weights.profileCompleteness }
  ];

  const hasPosts = account.posts_7d !== null && account.posts_7d !== undefined && account.posts_7d !== "";
  const hasReplies = account.replies_7d !== null && account.replies_7d !== undefined && account.replies_7d !== "";
  const hasLikes = account.likes_7d !== null && account.likes_7d !== undefined && account.likes_7d !== "";

  if (hasPosts) {
    const posts = Number(account.posts_7d);
    parts.push({ value: clamp(posts / 7, 0, 1) * 100, weight: config.weights.activity });
  }
  if (hasPosts && hasReplies) {
    const posts = Number(account.posts_7d);
    const replies = Number(account.replies_7d);
    parts.push({ value: clamp(replies / Math.max(posts, 1), 0, 1) * 100, weight: config.weights.conversation });
  }
  if (hasReplies && hasLikes && followers > 0) {
    const replies = Number(account.replies_7d);
    const likes = Number(account.likes_7d);
    const engagementRate = (replies + likes) / followers;
    parts.push({ value: clamp(engagementRate / 0.15, 0, 1) * 100, weight: config.weights.engagement });
  }

  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  const score = parts.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight;
  return Number(score.toFixed(1));
}
