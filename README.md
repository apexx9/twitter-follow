# GhanaConnect

A deliberately small, terminal-based account discovery and networking assistant for X.

## Stack

- Node.js (ES modules)
- SQLite via better-sqlite3
- No web server, frontend, AI API, or automated follow actions

## Setup

Requires Node.js 20 or newer.

```bash
npm install
npm start
```

## Commands

```bash
npm run import -- ./accounts.json
npm run recommendations
npm run stats
node src/cli.js mark username reviewed
node src/cli.js mark username followed
node src/cli.js mark username skipped
node src/cli.js open username
```

## Import format

Create an `accounts.json` file containing an array:

```json
[
  {
    "username": "example_user",
    "display_name": "Example User",
    "country": "Ghana",
    "followers": 850,
    "following": 620,
    "posts_7d": 12,
    "replies_7d": 8,
    "likes_7d": 34,
    "bio": "Interested in technology, music and community.",
    "tags": ["ghana", "community"],
    "source": "permitted-source"
  }
]
```

Allowed country values: `Ghana`, `Nigeria`, `Other Africa`, `International`, `Unknown`.

The initial importer accepts accounts with 100–2,000 followers. Engagement scoring uses the supplied recent activity fields; it does not claim to predict who will follow back.

## Discovery source

The first version intentionally does not scrape X, access account cookies, or automate follows. A discovery adapter can be added when a permitted source is selected. Until then, import candidate data collected through a source whose terms allow the intended use.

## Scope

This tool ranks and organises candidate accounts and opens profiles for manual review. It does not classify people by inferred gender or age, and it does not perform automated follow actions.
