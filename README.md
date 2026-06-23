# Watch-Anime

> **A full-stack anime streaming platform** - Next.js website + automated scraper that keeps your catalog in sync 24/7.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue?logo=mysql)](https://mysql.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [1. Database](#1-database)
  - [2. Website](#2-website)
  - [3. Auto-Insert Script](#3-auto-insert-script)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Database Schema](#database-schema)
- [OAuth Setup](#oauth-setup)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Watch-Anime** is a self-hosted anime streaming aggregator. It consists of two independent components that work together:

| Component | Tech Stack | Role |
|---|---|---|
| **Website** | Next.js 16, React 19, TypeScript, MySQL | Streaming UI, user accounts, player |
| **Auto-Insert Script** | Node.js, Cheerio, got-scraping | Catalog scraper + DB sync (runs every 3 h) |

The scraper automatically crawls [anime-sama.to](https://anime-sama.to), extracts anime metadata, fetches episode streaming links, and syncs everything into the MySQL database. The website then serves this data to users in a clean, responsive interface.

---

## Features

### For Users
- **Full Catalog** - Browse hundreds of anime with posters, synopses, and genres
- **Multi-language Playback** - VF, VOSTFR, VJ, VCN, VQC, VKR, VA, VF1, VF2
- **Integrated Video Player** - HLS streaming powered by Plyr + hls.js
- **Viewing History** - Automatically track where you left off
- **Favorites & Watch Later** - Organize your list
- **Recommendations** - Discover anime based on your history
- **Responsive Design** - Works on desktop, tablet, and mobile

### Authentication
- **Google OAuth** - Sign in with your Google account
- **Discord OAuth** - Sign in with your Discord account
- **Session Management** - Secure JWT sessions via NextAuth.js

### Automation (Auto-Insert Script)
- **Catalog Scraping** - Paginated crawl of the full anime catalog
- **Episode Extraction** - Parses `episodes.js` to extract all streaming players
- **Language Detection** - Automatically identifies available dubbed/subbed versions
- **Poster Fetching** - Resolves cover images via Kitsu -> Jikan -> AniList fallback chain
- **DB Sync** - Upserts all data (anime, seasons, episodes, players) without duplicates
- **Scheduled Runs** - Runs once at startup, then every 3 hours automatically
- **Retry Logic** - Exponential-backoff reconnection to the database

---

## Architecture

```
+---------------------------------------------+
|          Auto-Insert Script                 |
|                                             |
|  fetchLinksFromPage()  ->  fetchInfos()     |
|         |                     |             |
|   catalog pages          anime metadata     |
|   (paginated)           seasons, episodes   |
|         |                     |             |
|       getPoster()        checkLangsForSeason|
|   (Kitsu/Jikan/Anilist)  (per lang probe)  |
|                |                            |
|           syncAnime()  ->  MySQL DB         |
+----------------------+----------------------+
                       |  shared database
+----------------------v----------------------+
|              Next.js Website                |
|                                             |
|  App Router  ->  API Routes  ->  MySQL      |
|  React 19        NextAuth       mysql2      |
|  MUI + Tailwind  JWT sessions               |
+---------------------------------------------+
```

---

## Project Structure

```
Watch-Anime/
|
+-- website/                        # Next.js application
|   +-- src/
|   |   +-- app/                    # App Router pages & API routes
|   |   |   +-- catalogue/          # Browse all anime
|   |   |   +-- player/             # Video player
|   |   |   +-- history/            # Viewing history
|   |   |   +-- likes/              # Favorites
|   |   |   +-- watchlater/         # Watch later list
|   |   |   +-- recommandations/    # Recommendation page
|   |   |   +-- top-animes/         # Top anime rankings
|   |   |   +-- recent-update/      # Recently updated
|   |   |   +-- settings/           # User settings
|   |   |   +-- login/              # Auth page
|   |   |   +-- api/                # REST API routes
|   |   +-- components/             # Reusable React components
|   |   +-- hooks/                  # Custom React hooks
|   |   +-- lib/                    # DB client, auth config, utilities
|   |   +-- types/                  # TypeScript type definitions
|   +-- public/                     # Static assets
|   +-- server.js                   # Custom Node server
|   +-- next.config.ts
|   +-- .env.example
|
+-- auto-insert-script/             # Catalog scraper & DB sync
|   +-- index.js                    # Entry point - orchestrates full pipeline
|   +-- scraper.js                  # Fetching, parsing, poster resolution
|   +-- sync.js                     # Upsert logic for MySQL
|   +-- database.js                 # DB connection with retry logic
|   +-- config.js                   # ENV loading & shared constants
|   +-- logger.js                   # File-based error logger
|   +-- .env.example
|
+-- empty_database.sql              # Full MySQL schema (import this first)
+-- CHANGELOG.md
+-- LICENSE
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | >= 18 |
| npm | >= 9 |
| MySQL / MariaDB | >= 8.0 |

---

## Installation

### 1. Database

Import the provided schema into your MySQL instance:

```bash
mysql -u root -p < empty_database.sql
```

This creates all required tables (`tab_liste_anime`, `tab_saisons`, `tab_episodes`, `lecteurs`, `tab_langues`, `tab_categories`, `users`, `user_history`, `user_likes`, `user_watchlater`, ...).

### 2. Website

```bash
cd website
npm install
cp .env.example .env
# Edit .env with your values (see Configuration section)
```

### 3. Auto-Insert Script

```bash
cd auto-insert-script
npm install
# Create a .env file with your values (see Configuration section)
```

---

## Configuration

### Website - `website/.env`

```env
# Database
DB_HOST=localhost
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=your_database_name

# NextAuth
NEXTAUTH_SECRET=your_random_secret_min_32_chars
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

### Auto-Insert Script - `auto-insert-script/.env`

```env
# Database
db_host=localhost
db_port=3306
db_user=your_database_user
db_pass=your_database_password
db_name=your_database_name
```

---

## Running the Project

### Website (development)

```bash
cd website
npm run dev
# -> http://localhost:3000
```

### Website (production)

```bash
cd website
npm run build
npm start
```

### Auto-Insert Script

```bash
cd auto-insert-script
node index.js
```

The script runs **immediately on startup**, then repeats **every 3 hours**. Progress and errors are logged to `logs.txt`.

---

## Database Schema

The MySQL schema (see [`empty_database.sql`](./empty_database.sql)) revolves around these core tables:

| Table | Description |
|---|---|
| `tab_liste_anime` | Main anime catalog (title, slug, poster, description) |
| `tab_subname` | Alternative/Japanese titles for each anime |
| `tab_saisons` | Seasons linked to each anime |
| `tab_episodes` | Episodes per season + language |
| `tab_langues` | Available languages (VF, VOSTFR, VJ, ...) |
| `tab_categories` | Anime genres |
| `tab_categoriser` | Anime <-> genre many-to-many |
| `lecteurs` | Streaming player URLs per episode |
| `users` | Authenticated user accounts |
| `user_history` | Per-user viewing history |
| `user_likes` | Per-user favorites |
| `user_watchlater` | Per-user watch-later list |

---

## OAuth Setup

### Google

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project -> **APIs & Services** -> **Credentials**
3. Create an **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Copy **Client ID** and **Client Secret** into `website/.env`

### Discord

1. Open [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application -> **OAuth2** tab
3. Add redirect URI:
   ```
   http://localhost:3000/api/auth/callback/discord
   ```
4. Copy **Client ID** and **Client Secret** into `website/.env`

---

## Security

- **Never commit `.env` files** - they are listed in `.gitignore`
- **Use a strong `NEXTAUTH_SECRET`** - minimum 32 random characters (`openssl rand -base64 32`)
- **Restrict DB user privileges** - only grant SELECT/INSERT/UPDATE/DELETE on the target database
- **Validate OAuth redirect URIs** - only add the exact URIs you use in production

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a **Pull Request**

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## Support

- Bug reports / Feature requests: [GitHub Issues](https://github.com/ArthurAugis/Watch-Anime/issues)
- Discord community: [discord.com/invite/zX5ucDU5zn](https://discord.com/invite/zX5ucDU5zn)
