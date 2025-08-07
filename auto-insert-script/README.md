# 🤖 Watch-Anime Auto-Insert Script

Ce script Node.js automatise l'ajout de contenu dans la base de données Watch-Anime. Il peut scraper des sources d'animés, télécharger des affiches et gérer le catalogue via des commandes Discord.

## ⚠️ Important - Configuration requise

Ce script nécessite une configuration spécifique selon votre source de données. Les URLs et sélecteurs CSS doivent être adaptés à votre cas d'usage.

## 🚀 Installation

### Prérequis
- Node.js 18+
- Accès à une base de données MySQL
- Bot Discord (optionnel)
- Serveur SFTP pour les images (optionnel)

### Configuration
```bash
npm install
cp .env.example .env
# Éditez .env avec vos paramètres
```

## 🔧 Variables d'environnement

```env
# Base de données (obligatoire)
db_host=localhost
db_user=your_database_user
db_pass=your_database_password
db_name=watch_anime_db

# Discord Bot (optionnel)
discord_token=your_bot_token
discord_user_id=your_discord_user_id
discord_client_id=your_bot_client_id

# SFTP pour upload d'images (optionnel)
host_ssh=your_sftp_host
port_ssh=22
user_ssh=your_sftp_user
pass_ssh=your_sftp_password
SFTP_COVERS_PATH=/path/to/cdn/images/anime
```

## 🎯 Fonctionnalités

### 📥 Scraping automatique
- Récupération des données d'animés
- Extraction des liens d'épisodes multi-langues
- Détection automatique des lecteurs
- Gestion des saisons multiples

### 🖼️ Gestion des affiches
- Téléchargement depuis Kitsu.io, Jikan (MyAnimeList), AniList
- Conversion automatique en WebP
- Upload via SFTP

### 🤖 Bot Discord
- Commande `/change-affiche` pour l'administration
- Notifications de mise à jour
- Gestion des permissions

## 🚀 Utilisation

```bash
# Lancement du script
npm start

# ou directement
node index.js
```

## ⚙️ Adaptation du script

### 2. Sélecteurs CSS
Adaptez les sélecteurs pour votre source HTML :

```javascript
// Exemple pour récupérer les liens d'animés
$('#list_catalog a').map((_, el) => $(el).attr('href'))

// Exemple pour les informations d'anime
const titre = $('#titreOeuvre').text().trim();
const synopsis = $('p.description').text().trim();
```

### 3. Langues supportées
Modifiez le tableau des langues selon vos besoins :

```javascript
const LANGS = ['vf', 'vostfr', 'vo', 'vqc']; // Adaptez selon votre contexte
```

## 🔐 Sécurité

- Toutes les données sensibles sont dans `.env`
- Pas d'URL ou de credentials hardcodés
- Validation des paramètres Discord
- Gestion des erreurs et timeouts

## 📊 Logs

Le script génère un fichier `logs.txt` avec :
- Erreurs de scraping
- Statistiques d'upload
- Activités Discord bot

## 🤝 Discord Bot Setup

1. Créez une application sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez un bot et copiez le token
3. Invitez le bot avec les permissions :
   - `applications.commands`
   - `bot`
4. Configurez les variables d'environnement Discord

### Commandes disponibles

#### `/change-affiche`
Change l'affiche d'un animé.

**Paramètres :**
- `anime` : nom_url de l'animé
- `url` : Nouvelle URL de l'affiche

## 🛠️ Développement

### Structure du code
```
index.js
├── Configuration et imports
├── Fonctions SFTP et images
├── Bot Discord
├── Scraping et parsing
├── Base de données
└── Fonction principale
```

### Fonctions principales
- `downloadAndUploadCover()` : Upload d'affiches
- `getPoster()` : Recherche d'affiches sur les APIs
- `fetchLinksFromPage()` : Scraping d'une page
- `fetchInfos()` : Extraction d'infos d'anime
- `startDiscordBot()` : Démarrage du bot Discord

## 📝 Logs et Monitoring

Les logs incluent :
- `[COVER]` : Upload d'affiches
- `[DISCORD]` : Activité bot Discord
- `[SAISON]` : Traitement des saisons
- `[PAGE]` : Scraping des pages

## ⚠️ Limitations

### APIs tierces
- Respect du rate limiting
- Gestion des erreurs 429
- Cache des requêtes

### Légalité
- Le script ne stocke que les métadonnées
- Aucun contenu vidéo hébergé
- Respect des robots.txt

### Performance  
- Traitement par batch
- Optimisation mémoire
- Requêtes DB optimisées

## 🔄 Automatisation

### Cron (Linux/macOS)
```bash
# Exécution quotidienne à 2h
0 2 * * * cd /path/to/script && npm start
```

### Windows Task Scheduler
Créez une tâche qui exécute :
```cmd
cd C:\path\to\script && npm start
```

## 📞 Support

1. Vérifiez les logs d'erreur dans `logs.txt`
2. Consultez la documentation principale
3. Ouvrez une issue GitHub

## ⚡ Exemples de personnalisation

### Ajouter une nouvelle source d'affiches
```javascript
// Dans getPoster()
try {
  const res = await axios.get(`https://nouvelle-api.com/search?q=${titre}`);
  return res.data.poster_url;
} catch {}
```

### Modifier le format des épisodes
```javascript
// Adapter parseEpisodeNames() selon votre format
function parseEpisodeNames(scriptContent, maxEpisodes = 0) {
  // Votre logique de parsing
}
```

### Ajouter des notifications
```javascript
// Exemple d'envoi de notification
async function notifyUpdate(animeTitle, newEpisodes) {
  await sendDiscordDM(`Nouvel épisode de ${animeTitle} : ${newEpisodes} épisodes ajoutés !`);
}
```

---

**Note :** Ce script est conçu comme un exemple et un point de départ. Il doit être adapté selon votre source de données et vos besoins spécifiques.
