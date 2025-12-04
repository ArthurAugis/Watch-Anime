# 📚 API Documentation

## Overview

The Watch-Anime API is built with Next.js App Router and provides RESTful endpoints for managing anime, users, and streaming features.

## Base URL
```
http://localhost:3000/api (development)
https://your-domain.com/api (production)
```

## Authentication

### NextAuth.js
The API uses NextAuth.js for authentication with OAuth providers.

#### Authentication Endpoints
```
GET  /api/auth/signin          # Sign-in page
POST /api/auth/signin/:provider # Sign-in with provider
GET  /api/auth/callback/:provider # OAuth Callback
GET  /api/auth/signout         # Sign-out
GET  /api/auth/session         # Current session
```

#### Session Verification
```javascript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session) {
  return new Response('Unauthorized', { status: 401 });
}
```

## API Endpoints

### 🎬 Anime

#### `GET /api/anime/list`
Retrieves the list of anime with pagination.

**Query Parameters:**
- `page` (number, optional): Current page (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `search` (string, optional): Search term
- `genre` (string, optional): Filter by genre
- `year` (number, optional): Filter by year
- `status` (string, optional): Filter by status (en_cours, termine, a_venir)

**Response:**
```json
{
  "animes": [
    {
      "id": 1,
      "nom_anime": "Attack on Titan",
      "nom_url": "attack-on-titan",
      "affiche_url": "https://example.com/poster.jpg",
      "description": "Anime description...",
      "note": 9.2,
      "annee": 2013,
      "statut": "termine",
      "genre": "Action, Drama, Fantasy",
      "studio": "Wit Studio",
      "nb_episodes": 75,
      "nb_likes": 1250
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 15,
    "total_items": 300,
    "has_next": true,
    "has_previous": false
  }
}
```

#### `GET /api/anime/info`
Retrieves detailed information about an anime.

**Query Parameters:**
- `nom_url` (string, required): Anime URL name

**Response:**
```json
{
  "anime": {
    "id": 1,
    "nom_anime": "Attack on Titan",
    "nom_url": "attack-on-titan",
    "affiche_url": "https://example.com/poster.jpg",
    "description": "Full description...",
    "note": 9.2,
    "annee": 2013,
    "statut": "termine",
    "genre": "Action, Drama, Fantasy",
    "studio": "Wit Studio",
    "saisons": [
      {
        "saison": 1,
        "nb_episodes": 25,
        "langues": ["vf", "vostfr"]
      }
    ]
  }
}
```

#### `GET /api/anime/episodes`
Retrieves episodes for an anime.

**Query Parameters:**
- `nom_url` (string, required): Anime URL name
- `saison` (number, optional): Season number (default: 1)
- `langue` (string, optional): Episode language (vf, vostfr, vo)

**Response:**
```json
{
  "episodes": [
    {
      "numero_episode": 1,
      "nom_episode": "To You, in 2000 Years",
      "saison": 1,
      "langues": {
        "vf": [
          {
            "lecteur": "doodstream",
            "lien": "https://doodstream.com/embed/xxx",
            "qualite": "720p"
          }
        ],
        "vostfr": [
          {
            "lecteur": "streamtape",
            "lien": "https://streamtape.com/embed/xxx",
            "qualite": "1080p"
          }
        ]
      }
    }
  ]
}
```

#### `GET /api/anime/lecteurs`
Retrieves available players for an episode.

**Query Parameters:**
- `nom_url` (string, required): Anime URL name
- `episode` (number, required): Episode number
- `saison` (number, optional): Season number (default: 1)
- `langue` (string, required): Language (vf, vostfr, vo)

#### `GET /api/anime/langues`
Retrieves available languages for an anime.

**Query Parameters:**
- `nom_url` (string, required): Anime URL name

#### `GET /api/anime/saisons`
Retrieves available seasons for an anime.

#### `GET /api/anime/default`
Retrieves default anime for the home page.

#### `GET /api/anime/mostlike`
Retrieves most liked anime.

#### `GET /api/anime/recentupdate`
Retrieves recently updated anime.

### 👤 Authenticated Users

#### `POST /api/user/history/add`
Adds an episode to user history.

**Request Body:**
```json
{
  "nom_url": "attack-on-titan",
  "episode": 1,
  "saison": 1,
  "progression": 1420,
  "duree_totale": 1440,
  "termine": false
}
```

#### `GET /api/user/history/list`
Retrieves user history.

#### `GET /api/user/history/lastview`
Retrieves the last watched episode.

#### `POST /api/user/like/change`
Adds or removes an anime from favorites.

**Request Body:**
```json
{
  "nom_url": "attack-on-titan",
  "action": "add" // or "remove"
}
```

#### `GET /api/user/like/has`
Checks if an anime is in favorites.

#### `GET /api/user/like/list`
Retrieves the list of favorites.

#### `POST /api/user/watchlater/change`
Adds or removes an anime from the watchlist.

#### `GET /api/user/watchlater/has`
Checks if an anime is in the watchlist.

#### `GET /api/user/watchlater/list`
Retrieves the watchlist.

#### `GET /api/user/recommandation/list`
Retrieves personalized recommendations.

### 🎭 Guest Mode

Endpoints `/api/guest/*` allow unauthenticated users to temporarily save their data in localStorage.

#### Available Endpoints:
- `GET /api/guest/history/list`
- `GET /api/guest/like/list`
- `GET /api/guest/recommandation/list`
- `GET /api/guest/watchlater/list`

### 🛠️ Utilities

#### `GET /api/utils/changelogs`
Retrieves site changelogs.

**Response:**
```json
{
  "changelogs": [
    {
      "version": "1.2.0",
      "date_release": "2024-01-15",
      "contenu": "- Added multi-season support\n- Performance improvements\n- Bug fixes"
    }
  ]
}
```

## HTTP Status Codes

| Code | Meaning       | Description |
|------|---------------|-------------|
| 200  | OK            | Request successful |
| 201  | Created       | Resource created |
| 400  | Bad Request   | Invalid parameters |
| 401  | Unauthorized  | Authentication required |
| 403  | Forbidden     | Insufficient permissions |
| 404  | Not Found     | Resource not found |
| 500  | Server Error  | Server error |

## Error Handling

Standard error format:
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific detail"
  }
}
```

## Usage Examples

### Retrieve anime with search
```javascript
const response = await fetch('/api/anime/list?search=attack&genre=Action&page=1');
const data = await response.json();
console.log(data.animes);
```

### Add to history
```javascript
const response = await fetch('/api/user/history/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nom_url: 'attack-on-titan',
    episode: 1,
    saison: 1,
    progression: 1420,
    duree_totale: 1440,
    termine: false
  })
});
```

### Add to favorites
```javascript
const response = await fetch('/api/user/like/change', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nom_url: 'attack-on-titan',
    action: 'add'
  })
});
```

## Rate Limiting

- **Read**: 1000 requests/hour per IP
- **Write**: 100 requests/hour per authenticated user
- **Search**: 60 requests/minute per IP

## Cache

Responses are cached based on their type:
- **Anime List**: 5 minutes
- **Anime Info**: 1 hour
- **Episodes**: 30 minutes
- **User History**: No cache
- **Favorites**: 1 minute

## CORS

The API accepts cross-origin requests from:
- Domains configured in production
- `localhost:3000` in development

## Webhooks

### Notification Endpoint
`POST /api/webhooks/anime-update`

Allows external services to notify about anime updates.

**Required Headers:**
```
Authorization: Bearer YOUR_WEBHOOK_SECRET
Content-Type: application/json
```

**Request Body:**
```json
{
  "anime_id": 123,
  "nouveaux_episodes": [
    {
      "numero": 13,
      "saison": 2,
      "langue": "vostfr",
      "lecteur": "streamtape",
      "lien": "https://streamtape.com/embed/xxx"
    }
  ]
}
```

## JavaScript SDK (Optional)

```javascript
class WatchAnimeAPI {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async getAnimes(params = {}) {
    const url = new URL(`${this.baseUrl}/anime/list`, window.location.origin);
    Object.keys(params).forEach(key => 
      url.searchParams.append(key, params[key])
    );
    
    const response = await fetch(url);
    return response.json();
  }

  async addToHistory(data) {
    const response = await fetch(`${this.baseUrl}/user/history/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // ... other methods
}

// Usage
const api = new WatchAnimeAPI();
const animes = await api.getAnimes({ search: 'naruto' });
```
