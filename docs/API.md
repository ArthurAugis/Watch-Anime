# 📚 Documentation de l'API

## Vue d'ensemble

L'API Watch-Anime est construite avec Next.js App Router et fournit des endpoints RESTful pour la gestion des animés, utilisateurs, et fonctionnalités de streaming.

## Base URL
```
http://localhost:3000/api (développement)
https://votre-domaine.com/api (production)
```

## Authentification

### NextAuth.js
L'API utilise NextAuth.js pour l'authentification avec les providers OAuth.

#### Endpoints d'authentification
```
GET  /api/auth/signin          # Page de connexion
POST /api/auth/signin/:provider # Connexion avec provider
GET  /api/auth/callback/:provider # Callback OAuth
GET  /api/auth/signout         # Déconnexion
GET  /api/auth/session         # Session actuelle
```

#### Vérification de session
```javascript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session) {
  return new Response('Unauthorized', { status: 401 });
}
```

## Endpoints de l'API

### 🎬 Animés

#### `GET /api/anime/list`
Récupère la liste des animés avec pagination.

**Paramètres de requête :**
- `page` (number, optional) : Page courante (défaut: 1)
- `limit` (number, optional) : Nombre d'éléments par page (défaut: 20, max: 100)
- `search` (string, optional) : Terme de recherche
- `genre` (string, optional) : Filtrer par genre
- `year` (number, optional) : Filtrer par année
- `status` (string, optional) : Filtrer par statut (en_cours, termine, a_venir)

**Réponse :**
```json
{
  "animes": [
    {
      "id": 1,
      "nom_anime": "Attack on Titan",
      "nom_url": "attack-on-titan",
      "affiche_url": "https://example.com/poster.jpg",
      "description": "Description de l'anime...",
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
Récupère les informations détaillées d'un anime.

**Paramètres de requête :**
- `nom_url` (string, required) : Nom URL de l'anime

**Réponse :**
```json
{
  "anime": {
    "id": 1,
    "nom_anime": "Attack on Titan",
    "nom_url": "attack-on-titan",
    "affiche_url": "https://example.com/poster.jpg",
    "description": "Description complète...",
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
Récupère les épisodes d'un anime.

**Paramètres de requête :**
- `nom_url` (string, required) : Nom URL de l'anime
- `saison` (number, optional) : Numéro de saison (défaut: 1)
- `langue` (string, optional) : Langue des épisodes (vf, vostfr, vo)

**Réponse :**
```json
{
  "episodes": [
    {
      "numero_episode": 1,
      "nom_episode": "À toi, dans 2000 ans",
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
Récupère les lecteurs disponibles pour un épisode.

**Paramètres de requête :**
- `nom_url` (string, required) : Nom URL de l'anime
- `episode` (number, required) : Numéro de l'épisode
- `saison` (number, optional) : Numéro de saison (défaut: 1)
- `langue` (string, required) : Langue (vf, vostfr, vo)

#### `GET /api/anime/langues`
Récupère les langues disponibles pour un anime.

**Paramètres de requête :**
- `nom_url` (string, required) : Nom URL de l'anime

#### `GET /api/anime/saisons`
Récupère les saisons disponibles pour un anime.

#### `GET /api/anime/default`
Récupère les animés par défaut pour la page d'accueil.

#### `GET /api/anime/mostlike`
Récupère les animés les plus aimés.

#### `GET /api/anime/recentupdate`
Récupère les animés récemment mis à jour.

### 👤 Utilisateurs authentifiés

#### `POST /api/user/history/add`
Ajoute un épisode à l'historique utilisateur.

**Corps de la requête :**
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
Récupère l'historique de l'utilisateur.

#### `GET /api/user/history/lastview`
Récupère le dernier épisode regardé.

#### `POST /api/user/like/change`
Ajoute ou retire un anime des favoris.

**Corps de la requête :**
```json
{
  "nom_url": "attack-on-titan",
  "action": "add" // ou "remove"
}
```

#### `GET /api/user/like/has`
Vérifie si un anime est dans les favoris.

#### `GET /api/user/like/list`
Récupère la liste des favoris.

#### `POST /api/user/watchlater/change`
Ajoute ou retire un anime de la watchlist.

#### `GET /api/user/watchlater/has`
Vérifie si un anime est dans la watchlist.

#### `GET /api/user/watchlater/list`
Récupère la watchlist.

#### `GET /api/user/recommandation/list`
Récupère les recommandations personnalisées.

### 🎭 Mode invité

Les endpoints `/api/guest/*` permettent aux utilisateurs non authentifiés de sauvegarder temporairement leurs données dans le localStorage.

#### Endpoints disponibles :
- `GET /api/guest/history/list`
- `GET /api/guest/like/list`  
- `GET /api/guest/recommandation/list`
- `GET /api/guest/watchlater/list`

### 🛠️ Utilitaires

#### `GET /api/utils/changelogs`
Récupère les changelogs du site.

**Réponse :**
```json
{
  "changelogs": [
    {
      "version": "1.2.0",
      "date_release": "2024-01-15",
      "contenu": "- Ajout du support multi-saisons\n- Amélioration des performances\n- Correction de bugs"
    }
  ]
}
```

## Codes de statut HTTP

| Code | Signification | Description |
|------|---------------|-------------|
| 200  | OK            | Requête réussie |
| 201  | Created       | Ressource créée |
| 400  | Bad Request   | Paramètres invalides |
| 401  | Unauthorized  | Authentification requise |
| 403  | Forbidden     | Permissions insuffisantes |
| 404  | Not Found     | Ressource non trouvée |
| 500  | Server Error  | Erreur serveur |

## Gestion des erreurs

Format standard des erreurs :
```json
{
  "error": "Description de l'erreur",
  "code": "ERROR_CODE",
  "details": {
    "field": "Détail spécifique"
  }
}
```

## Exemples d'utilisation

### Récupérer des animés avec recherche
```javascript
const response = await fetch('/api/anime/list?search=attack&genre=Action&page=1');
const data = await response.json();
console.log(data.animes);
```

### Ajouter à l'historique
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

### Ajouter aux favoris
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

- **Lecture** : 1000 requêtes/heure par IP
- **Écriture** : 100 requêtes/heure par utilisateur authentifié
- **Recherche** : 60 requêtes/minute par IP

## Cache

Les réponses sont mises en cache selon leur type :
- **Liste d'animés** : 5 minutes
- **Informations anime** : 1 heure
- **Épisodes** : 30 minutes
- **Historique utilisateur** : Pas de cache
- **Favoris** : 1 minute

## CORS

L'API accepte les requêtes cross-origin depuis :
- Domaines configurés en production
- `localhost:3000` en développement

## Webhooks

### Endpoint de notification
`POST /api/webhooks/anime-update`

Permet aux services externes de notifier la mise à jour d'animés.

**Headers requis :**
```
Authorization: Bearer YOUR_WEBHOOK_SECRET
Content-Type: application/json
```

**Corps de la requête :**
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

## SDK JavaScript (optionnel)

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

  // ... autres méthodes
}

// Usage
const api = new WatchAnimeAPI();
const animes = await api.getAnimes({ search: 'naruto' });
```
