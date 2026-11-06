# GhanaConnect

A small terminal-based account discovery and networking assistant for X.

## Stack

- Node.js 20+
- JavaScript ES modules
- SQLite

No server, frontend, AI API, browser-cookie access, scraping, or automated follows.

## Setup

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

## Audience targets

The default planning mix is 30% Ghanaian women, 10% Nigerian women, 10% international women, 35% Ghanaian men, 10% tech-related accounts, and 5% other relevant accounts.

The segment field is supplied explicitly in the import data; the tool does not infer gender or age from names, photos, or other proxies. Age is not collected.

## Import format

Create an `accounts.json` file containing an array:

```json
[
  {
    "username": "example_user",
    "display_name": "Example User",
    "country": "Ghana",
    "segment": "ghanaian_women",
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

Allowed countries: `Ghana`, `Nigeria`, `Other Africa`, `International`, `Unknown`.

Allowed segments: `ghanaian_women`, `nigerian_women`, `international_women`, `ghanaian_men`, `tech`, `other`.

The importer accepts accounts with 100–2,000 followers. Engagement scoring uses the supplied recent activity counts; it does not predict follow-backs.

## Discovery source

The first version does not scrape X or access account cookies. Import data only from a source whose terms permit this use. A provider adapter can be added once the data source is selected.

## Scope

The tool ranks and organises candidates, opens profiles for manual review, and records your review status. It does not perform automated follow actions.
