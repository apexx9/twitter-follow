# GhanaConnect

A lightweight, free, terminal-based account discovery and networking assistant for X.

## Stack

- Node.js 20+
- JavaScript ES modules
- SQLite

No paid API or server is required. Discovery currently generates targeted public X search links; it does not scrape X, access browser cookies, or automate follows.

## Setup

```bash
pnpm install
pnpm start
```

## Commands

```bash
pnpm start
pnpm discover
pnpm discover ghana_conversations
pnpm run add
pnpm run seed-import -- ./seed-accounts.json
pnpm run seed-summary
pnpm recommendations
pnpm stats
pnpm run import -- ./accounts.json
node src/cli.js mark username reviewed
node src/cli.js mark username followed
node src/cli.js mark username skipped
node src/cli.js open username
```

## Free discovery workflow

1. Run `pnpm discover` to print targeted X search links for all discovery groups.
2. Optionally pass one segment, e.g. `pnpm discover african_technology`.
3. Open a search link and inspect public profiles manually.
4. Run `pnpm run add` to save a candidate. Enter the username, verified follower count, country, discovery group, display name, and bio. Activity metrics are left unknown unless you provide them.
5. Run `pnpm recommendations` to see the ranked candidate list.

Search results are generated as ordinary X search URLs using interest themes from the initial seed-network review: Ghanaian conversation, creativity, lifestyle, fashion, books, music, sport, and technology. The app does not fetch, scrape, or automatically collect profile data.

## Discovery focus

The search groups focus on Ghanaian conversations, creative interests, sports and music, students and builders, Nigerian communities, African technology, and wider interests. These are topic and location searches; the tool does not classify people by gender or age.

## Account filters and scoring

The importer and interactive add command accept accounts with 100–2,000 followers. Scores use only information supplied. If recent activity metrics are missing, they are excluded from the score rather than treated as zero. Profile-only scores are provisional and do not predict follow-backs.

## Import format

Create an `accounts.json` file containing an array with fields such as:

```json
[
  {
    "username": "example_user",
    "display_name": "Example User",
    "country": "Ghana",
    "segment": "african_technology",
    "followers": 850,
    "following": 620,
    "posts_7d": 12,
    "replies_7d": 8,
    "likes_7d": 34,
    "bio": "Interested in technology and community.",
    "tags": ["ghana", "technology"],
    "source": "manual-review"
  }
]
```

Allowed countries: `Ghana`, `Nigeria`, `Other Africa`, `International`, `Unknown`.

Allowed segments: `ghana_conversations`, `ghana_creative`, `ghana_sports_music`, `ghana_students_builders`, `nigeria_communities`, `african_technology`, `wider_interests`.

## Scope

GhanaConnect helps discover search topics, organise candidate accounts, rank supplied information, open profiles, and record review status. Following is always manual.


## Personalised seed network

Export your own following-list sample into a local `seed-accounts.json` file. Keep this file private and do not commit it to the public repository.

Run:

```bash
pnpm run seed-import -- ./seed-accounts.json
pnpm run seed-summary
```

The seed summary extracts broad interest themes from the bios you provide and creates a personalised Ghana X search link. It does not infer age or gender, and it does not scrape X.
