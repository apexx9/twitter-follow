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
pnpm discover ghanaian_women
pnpm run add
pnpm recommendations
pnpm stats
pnpm run import -- ./accounts.json
node src/cli.js mark username reviewed
node src/cli.js mark username followed
node src/cli.js mark username skipped
node src/cli.js open username
```

## Free discovery workflow

1. Run `pnpm discover` to print targeted X search links for all audience segments.
2. Optionally pass one segment, e.g. `pnpm discover tech`.
3. Open a search link and inspect public profiles manually.
4. Run `pnpm run add` to save a candidate. Enter only details you can verify; leave unknown metrics at zero.
5. Run `pnpm recommendations` to see the ranked candidate list.

Search results are generated as ordinary X search URLs using interest themes from the initial seed-network review: Ghanaian conversation, creativity, lifestyle, fashion, books, music, sport, and technology. The app does not fetch, scrape, or automatically collect profile data.

## Audience targets

The default planning mix is 30% Ghanaian women, 10% Nigerian women, 10% international women, 35% Ghanaian men, 10% tech-related accounts, and 5% other relevant accounts.

Segments are selected explicitly by the user based on reliable, voluntarily disclosed information. The tool does not infer gender or age from names, photos, or proxies. Age is not collected.

## Account filters and scoring

The importer and interactive add command accept accounts with 100–2,000 followers. Scores use the supplied recent activity counts and profile details; they do not predict follow-backs. Unknown activity should be left at zero rather than guessed.

## Import format

Create an `accounts.json` file containing an array with fields such as:

```json
[
  {
    "username": "example_user",
    "display_name": "Example User",
    "country": "Ghana",
    "segment": "tech",
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

Allowed segments: `ghanaian_women`, `nigerian_women`, `international_women`, `ghanaian_men`, `tech`, `other`.

## Scope

GhanaConnect helps discover search topics, organise candidate accounts, rank supplied information, open profiles, and record review status. Following is always manual.
