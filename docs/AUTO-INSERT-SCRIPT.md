# ⚙️ Script d'Auto-insertion

Le script d'auto-insertion est un outil Node.js qui automatise l'ajout de contenu dans la base de données Watch-Anime. Il permet de scraper des sources, télécharger des affiches, et gérer le catalogue via des commandes Discord.

## 🎯 Fonctionnalités

### 📥 Scraping automatique
- Récupération automatique des données d'animés depuis des sources
- Extraction des liens d'épisodes multi-langues
- Détection automatique des lecteurs disponibles
- Gestion des saisons multiples

### 🖼️ Gestion des affiches
- Téléchargement automatique des posters depuis les APIs :
  - Kitsu.io
  - Jikan (MyAnimeList)
  - AniList GraphQL
- Conversion automatique en format WebP
- Upload via SFTP vers le CDN

### 🤖 Bot Discord
- Commandes slash pour l'administration
- Changement d'affiche via Discord
- Notifications de mise à jour
- Gestion des permissions administrateur

## 📦 Installation

### Prérequis
- Node.js 18+
- Accès à la base de données MySQL
- Bot Discord (optionnel)
- Serveur SFTP pour les images (optionnel)

### Configuration
```bash
cd auto-insert-script
npm install
cp .env.example .env
```

### Variables d'environnement
```env
# Base de données (obligatoire)
db_host=localhost
db_user=your_database_user
db_pass=your_database_password

# Discord Bot (optionnel)
discord_token=your_bot_token
discord_user_id=your_discord_user_id
discord_client_id=your_bot_client_id

# SFTP pour upload d'images (optionnel)
host_ssh=your_sftp_host
port_ssh=22
user_ssh=your_sftp_user
pass_ssh=your_sftp_password
```

## 🚀 Usage

### Lancement du script
```bash
node index.js
```

### Modes d'exécution

#### 1. Mode interactif
Le script vous guide à travers les différentes options :
- Scraper une source spécifique
- Mettre à jour les affiches manquantes
- Vérifier les liens morts
- Démarrer le bot Discord

#### 2. Mode automatique
Configuration des tâches automatiques via cron ou scheduler système.

## 📊 Fonctionnalités détaillées

### Scraping d'animés
```javascript
// Le script peut scraper automatiquement depuis diverses sources
const animeData = {
  nom_anime: "Attack on Titan",
  nom_url: "attack-on-titan", 
  description: "Dans un monde où...",
  genre: "Action, Drama, Fantasy",
  annee: 2013,
  studio: "Wit Studio",
  affiche_url: "auto-detected"
};
```

### Gestion des épisodes
```javascript
// Structure des épisodes détectés
const episodes = [
  {
    numero_episode: 1,
    nom_episode: "À toi, dans 2000 ans",
    saison: 1,
    langue: "vostfr", // ou "vf", "vo"
    lecteur: "streamtape", // ou "doodstream", etc.
    lien: "https://streamtape.com/embed/xxxxx",
    qualite: "1080p"
  }
];
```

### Récupération d'affiches
```javascript
// Recherche automatique sur plusieurs APIs
async function getPoster(titre) {
  // 1. Kitsu.io
  // 2. Jikan (MyAnimeList)
  // 3. AniList GraphQL
  // Retourne la meilleure qualité disponible
}
```

### Upload SFTP
```javascript
// Conversion et upload automatique
const sharp = require('sharp');
const webpBuffer = await sharp(imageBuffer)
  .webp({ quality: 90 })
  .toBuffer();

// Upload vers le CDN
await sftp.put(webpBuffer, `/path/to/cdn/${filename}`);
```

## 🤖 Commandes Discord

### Configuration du Bot
1. Créez une application sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez un bot et copiez le token
3. Invitez le bot sur votre serveur avec les permissions :
   - `applications.commands`
   - `bot`

### Commandes disponibles

#### `/change-affiche`
Change l'affiche d'un animé dans la base de données.

**Paramètres :**
- `anime` : nom_url de l'animé
- `url` : Nouvelle URL de l'affiche

**Exemple :**
```
/change-affiche anime:attack-on-titan url:https://example.com/new-poster.jpg
```

### Restrictions de sécurité
- Seul l'administrateur configuré peut utiliser les commandes
- Vérification de l'ID utilisateur Discord
- Validation des paramètres avant exécution

## 📁 Structure du script

```javascript
// index.js - Structure principale

// Configuration et imports
const sharp = require('sharp');
const SftpClient = require('ssh2-sftp-client');
const { Client, GatewayIntentBits } = require('discord.js');

// Fonctions principales
async function downloadAndUploadCover(imageUrl, destFileName)
async function getPoster(titre)
async function fetchLinksFromPage(page)
async function parseEpisodeNames(scriptContent)
async function checkLinksAvailability(baseUrls, languages)

// Bot Discord
async function startDiscordBot()
async function registerSlashCommand()

// Scraping et base de données
async function insertAnimeData(animeData)
async function updateEpisodes(animeId, episodes)
```

## 🛡️ Sécurisation pour l'open source

### Données sensibles supprimées
- URLs de scraping spécifiques
- Identifiants de services tiers
- Configurations serveur

### Configuration sécurisée
```javascript
// Utilisation exclusive des variables d'environnement
const SFTP_CONFIG = {
  host: process.env.host_ssh,
  port: process.env.port_ssh,
  username: process.env.user_ssh,
  password: process.env.pass_ssh,
};

const DB_CONFIG = {
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_pass,
  database: process.env.db_name || "watch_anime_db",
};
```

## 📝 Logs et Monitoring

### Système de logs
```javascript
function logError(message) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${message}`);
  // Optionnel : sauvegarder dans un fichier
}

function logSuccess(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ ${message}`);
}
```

### Monitoring
- Logs des erreurs de scraping
- Statistiques d'upload d'images
- Métriques de performance
- Alertes Discord (optionnel)

## 🔄 Automatisation

### Configuration Cron (Linux/macOS)
```bash
# Exécution quotidienne à 2h du matin
0 2 * * * cd /path/to/auto-insert-script && node index.js --auto

# Vérification des liens morts hebdomadaire
0 3 * * 0 cd /path/to/auto-insert-script && node index.js --check-links
```

### Windows Task Scheduler
Créez une tâche planifiée qui exécute :
```cmd
cd C:\path\to\auto-insert-script && node index.js --auto
```

## 🚨 Gestion des erreurs

### Erreurs communes
```javascript
// Gestion des timeouts réseau
const axios = require('axios');
const instance = axios.create({
  timeout: 30000,
  retry: 3
});

// Gestion des erreurs SFTP
try {
  await sftp.put(buffer, remotePath);
} catch (error) {
  if (error.code === 'ENOENT') {
    // Créer le dossier et réessayer
    await sftp.mkdir(path.dirname(remotePath), true);
    await sftp.put(buffer, remotePath);
  }
}
```

### Récupération automatique
```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## 🧪 Tests

### Tests unitaires
```bash
npm test
```

### Test des fonctions principales
```javascript
// test/scraping.test.js
describe('Scraping functions', () => {
  test('getPoster should return valid URL', async () => {
    const poster = await getPoster('Naruto');
    expect(poster).toMatch(/^https?:\/\/.+\.(jpg|jpeg|png)$/i);
  });

  test('parseEpisodeNames should extract episodes', () => {
    const episodes = parseEpisodeNames(mockHtml);
    expect(episodes).toHaveLength(12);
    expect(episodes[0]).toHaveProperty('numero_episode', 1);
  });
});
```

## 🛠️ Développement

### Mode développement
```bash
# Avec rechargement automatique
npm install -g nodemon
nodemon index.js
```

### Variables d'environnement de dev
```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

### Debugging
```javascript
// Mode debug
if (process.env.DEBUG === 'true') {
  console.log('Debug info:', { animeData, episodes });
}
```

## ⚠️ Limitations et Considérations

### Respect des APIs
- Rate limiting respecté pour les APIs tierces
- Gestion des erreurs 429 (Too Many Requests)
- Cache des requêtes pour éviter les doublons

### Légalité
- Le script ne stocke que les métadonnées
- Aucun contenu vidéo n'est hébergé
- Respect des robots.txt et Terms of Service

### Performance
- Traitement par batch pour éviter la surcharge
- Gestion de la mémoire pour les gros datasets
- Optimisation des requêtes base de données

## 📞 Support

Pour les problèmes liés au script :
1. Vérifiez les logs d'erreur
2. Consultez la section troubleshooting
3. Ouvrez une issue sur GitHub avec les détails

## 🔄 Mise à jour

```bash
git pull origin main
npm install  # Met à jour les dépendances
# Vérifiez le changelog pour les breaking changes
```
