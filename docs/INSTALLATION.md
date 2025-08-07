# 🔧 Installation et Configuration

## Prérequis

### Système requis
- **Node.js** : Version 18.0.0 ou supérieure
- **MySQL** : Version 8.0 ou supérieure  
- **npm** : Installé avec Node.js
- **Git** : Pour cloner le repository

### Vérification des prérequis
```bash
node --version    # Doit afficher v18.0.0+
npm --version     # Doit afficher 9.0.0+
mysql --version   # Doit afficher 8.0.0+
```

## Installation étape par étape

### 1. Clonage du projet
```bash
git clone https://github.com/ArthurAugis/Watch-Anime.git
cd Watch-Anime
```

### 2. Configuration de la base de données

#### Création de la base de données
```bash
# Connectez-vous à MySQL
mysql -u root -p

# Dans le prompt MySQL
CREATE DATABASE watch_anime_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'watch_anime_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_fort';
GRANT ALL PRIVILEGES ON watch_anime_db.* TO 'watch_anime_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Import du schéma
```bash
# Depuis la racine du projet
mysql -u watch_anime_user -p watch_anime_db < empty_database.sql
```

### 3. Configuration du site web

#### Installation des dépendances
```bash
cd website
npm install
```

#### Configuration de l'environnement
```bash
cp .env.example .env
```

Éditez le fichier `.env` :
```env
# Base de données
DB_HOST=localhost
DB_USER=watch_anime_user
DB_PASS=votre_mot_de_passe_fort
DB_NAME=watch_anime_db

# NextAuth (générez une clé secrète forte)
NEXTAUTH_SECRET=votre_secret_nextauth_tres_long_et_aleatoire
NEXTAUTH_URL=http://localhost:3000

# OAuth Google (voir section OAuth)
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret

# OAuth Discord (voir section OAuth)
DISCORD_CLIENT_ID=votre_discord_client_id
DISCORD_CLIENT_SECRET=votre_discord_client_secret
```

### 4. Configuration OAuth

#### Google OAuth
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API "Google+ API"
4. Allez dans "Identifiants" > "Créer des identifiants" > "ID client OAuth 2.0"
5. Type d'application : "Application Web"
6. URLs autorisées : `http://localhost:3000/api/auth/callback/google`
7. Copiez le Client ID et Client Secret dans votre `.env`

#### Discord OAuth
1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquez "New Application"
3. Dans l'onglet "OAuth2" :
   - Copiez le Client ID
   - Générez et copiez le Client Secret
   - Ajoutez `http://localhost:3000/api/auth/callback/discord` dans les redirections
4. Collez les valeurs dans votre `.env`

### 5. Configuration du script d'auto-insertion (optionnel)

```bash
cd ../auto-insert-script
npm install
cp .env.example .env
```

Éditez `auto-insert-script/.env` :
```env
# Base de données (mêmes valeurs que le site)
db_host=localhost
db_user=watch_anime_user
db_pass=votre_mot_de_passe_fort

# Discord Bot (optionnel - pour les commandes admin)
discord_token=votre_bot_token
discord_user_id=votre_user_id
discord_client_id=votre_client_id

# SSH (optionnel - pour l'upload d'images)
host_ssh=votre_serveur_ssh
port_ssh=22
user_ssh=votre_user_ssh
pass_ssh=votre_password_ssh
```

### 6. Génération du secret NextAuth

```bash
# Générez un secret fort (32 caractères minimum)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiez le résultat dans `NEXTAUTH_SECRET` de votre fichier `.env`.

### 7. Premier lancement

```bash
cd website
npm run dev
```

Le site sera accessible sur : http://localhost:3000

## Vérification de l'installation

### Tests de base
1. **Page d'accueil** : Visitez http://localhost:3000
2. **Base de données** : Vérifiez que les tables sont créées
3. **Authentification** : Testez la connexion Google/Discord
4. **API** : Testez http://localhost:3000/api/anime/list

### Résolution des problèmes courants

#### Erreur de connexion à la base de données
```bash
# Vérifiez que MySQL fonctionne
sudo systemctl status mysql  # Linux
# ou
brew services list | grep mysql  # macOS

# Testez la connexion
mysql -u watch_anime_user -p watch_anime_db
```

#### Erreur NextAuth
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Vérifiez que `NEXTAUTH_URL` correspond à votre URL

#### Erreur OAuth
- Vérifiez les URLs de redirection dans Google/Discord
- Vérifiez que les Client ID/Secret sont corrects

## Configuration de production

### Variables d'environnement production
```env
NEXTAUTH_URL=https://votre-domaine.com
DB_HOST=votre-serveur-db
# ... autres variables adaptées à la production
```

### Build de production
```bash
cd website
npm run build
npm start
```

### Sécurité production
- Utilisez HTTPS obligatoire
- Configurez des utilisateurs de base de données avec privilèges limités  
- Utilisez des secrets forts et uniques
- Configurez un reverse proxy (Nginx/Apache)
- Activez les logs d'audit

## Mise à jour

```bash
git pull origin main
cd website && npm install
cd ../auto-insert-script && npm install
# Redémarrez l'application
```
