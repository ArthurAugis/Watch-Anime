# 🎌 Watch-Anime - Plateforme de Streaming d'Animés

Une plateforme moderne et responsive pour regarder des animés en streaming, développée avec Next.js, TypeScript et MySQL.

## ✨ Fonctionnalités

### 🎬 Pour les utilisateurs
- **Catalogue complet** : Parcourez une large sélection d'animés
- **Streaming multi-langue** : Support de plusieurs langues de sous-titres/doublage
- **Historique personnalisé** : Suivez votre progression de visionnage
- **Liste de favoris** : Sauvegardez vos animés préférés
- **Watch Later** : Planifiez vos prochains visionnages
- **Recommandations** : Découvrez de nouveaux animés adaptés à vos goûts
- **Interface responsive** : Optimisé pour desktop, tablette et mobile

### 🔐 Système d'authentification
- **OAuth Google** : Connexion rapide avec votre compte Google
- **OAuth Discord** : Connexion avec votre compte Discord
- **Gestion des sessions** : Sessions sécurisées avec NextAuth.js

### 🛠️ Administration
- **Script d'auto-insertion** : Automatisation de l'ajout de contenu
- **Bot Discord** : Commandes d'administration via Discord
- **Gestion des affiches** : Upload automatique des images

## 🚀 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- MySQL (version 8.0 ou supérieure)
- Un serveur web (Apache/Nginx)

### 1. Clonage du projet
```bash
git clone https://github.com/ArthurAugis/Watch-Anime.git
cd Watch-Anime
```

### 2. Configuration de la base de données
```bash
# Importez le schema de base de données
mysql -u root -p < empty_database.sql
```

### 3. Configuration du site web
```bash
cd website
npm install
cp .env.example .env
```

Editez le fichier `.env` avec vos configurations :
- Base de données MySQL
- Clés OAuth (Google, Discord)
- Secret NextAuth

### 4. Configuration du script d'auto-insertion (optionnel)
```bash
cd ../auto-insert-script
npm install
cp .env.example .env
```

### 5. Lancement du projet
```bash
cd website
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
Watch-Anime/
├── website/                    # Application Next.js principale
│   ├── src/
│   │   ├── app/               # Pages et API routes (App Router)
│   │   ├── components/        # Composants React réutilisables
│   │   └── lib/              # Utilitaires (auth, db)
│   ├── public/               # Fichiers statiques
│   └── package.json
├── auto-insert-script/        # Script d'automatisation
│   ├── index.js              # Script principal
│   └── package.json
├── empty_database.sql         # Schema de base de données
└── docs/                     # Documentation
```

## 🔧 Configuration

### Variables d'environnement

#### Site web (`website/.env`)
```env
# Base de données
DB_HOST=localhost
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=your_database_name

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth Discord
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

#### Script d'auto-insertion (`auto-insert-script/.env`)
```env
# Base de données
db_host=localhost
db_user=your_database_user
db_pass=your_database_password

# Discord Bot (optionnel)
discord_token=your_discord_bot_token
discord_user_id=your_discord_user_id
discord_client_id=your_discord_client_id

# SSH pour upload d'images (optionnel)
host_ssh=your_ssh_host
port_ssh=22
user_ssh=your_ssh_user
pass_ssh=your_ssh_password
```

### Configuration OAuth

#### Google OAuth
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+ et l'API OAuth
4. Créez des identifiants OAuth 2.0
5. Ajoutez `http://localhost:3000/api/auth/callback/google` aux URLs autorisées

#### Discord OAuth
1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Dans OAuth2, ajoutez `http://localhost:3000/api/auth/callback/discord` aux redirections
4. Copiez le Client ID et Client Secret

## 📊 Base de données

Le projet utilise MySQL avec les tables principales :
- `tab_liste_anime` : Catalogue des animés
- `tab_episodes` : Episodes et liens de streaming
- `users` : Utilisateurs authentifiés
- `user_history` : Historique de visionnage
- `user_likes` : Favoris des utilisateurs
- `user_watchlater` : Liste "À regarder plus tard"

Voir `empty_database.sql` pour le schema complet.

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commitez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🛡️ Sécurité

- Ne jamais commiter les fichiers `.env`
- Utilisez des secrets forts pour `NEXTAUTH_SECRET`
- Configurez correctement les URLs autorisées pour OAuth
- Sécurisez votre base de données avec des utilisateurs à privilèges limités

## 📞 Support

Pour toute question ou problème :
- Rejoignez notre Discord : https://discord.com/invite/zX5ucDU5zn
- Ouvrez une issue sur GitHub
- Consultez la documentation dans le dossier `docs/`
