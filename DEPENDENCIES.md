# 📦 Dépendances et Versions

Ce fichier liste toutes les dépendances utilisées dans le projet Watch-Anime, leurs versions et leurs rôles.

## 🌐 Site Web (website/)

### Dependencies de Production

#### Framework & Runtime
- **next** `^15.3.3` - Framework React full-stack avec SSR/SSG
- **react** `^19.0.0` - Bibliothèque UI pour interfaces utilisateur
- **react-dom** `^19.0.0` - Package pour le rendu DOM de React

#### Authentification & Sécurité
- **next-auth** `^4.24.11` - Authentification pour Next.js (OAuth, JWT)
- **bcryptjs** `^3.0.2` - Hachage de mots de passe (si nécessaire)
- **jsonwebtoken** `^9.0.2` - Gestion des tokens JWT
- **nanoid** `^5.1.3` - Générateur d'IDs uniques et sécurisés

#### Base de Données
- **mysql2** `^3.12.0` - Client MySQL moderne avec support Promise
- **dotenv** `^16.4.7` - Chargement des variables d'environnement

#### Interface Utilisateur
- **@mui/material** `^6.4.6` - Composants Material-UI pour React
- **@mui/icons-material** `^6.4.6` - Icônes Material-UI
- **@emotion/react** `^11.14.0` - CSS-in-JS pour Material-UI
- **@emotion/styled** `^11.14.0` - Composants stylés pour Emotion
- **@fontsource/roboto** `^5.2.0` - Police Roboto auto-hébergée
- **react-icons** `^5.5.0` - Collection d'icônes populaires
- **styled-components** `^6.1.15` - CSS-in-JS pour composants stylés

#### Lecteur Vidéo
- **plyr** `^3.7.8` - Lecteur vidéo HTML5 personnalisable
- **plyr-react** `^5.3.0` - Wrapper React pour Plyr
- **hls.js** `^1.6.3` - Lecteur HLS pour streaming adaptatif

#### Carousels & UI Components
- **react-responsive-carousel** `^3.2.23` - Carousel responsive pour React

#### Utilitaires
- **js-cookie** `^3.0.5` - Gestion simple des cookies
- **cookie** `^1.0.2` - Parseur de cookies pour Node.js
- **crypto** `^1.0.1` - Fonctions cryptographiques
- **path** `^0.12.7` - Utilitaires de chemins de fichiers
- **zod** `^3.24.2` - Validation de schémas TypeScript-first

#### Captcha & Email
- **react-google-recaptcha** `^3.1.0` - Intégration reCAPTCHA
- **nodemailer** `^6.10.0` - Envoi d'emails depuis Node.js

### Dependencies de Développement

#### TypeScript & Types
- **typescript** `^5` - Superset typé de JavaScript
- **@types/node** `^20` - Types TypeScript pour Node.js
- **@types/react** `^19` - Types TypeScript pour React
- **@types/react-dom** `^19` - Types TypeScript pour React DOM
- **@types/js-cookie** `^3.0.6` - Types pour js-cookie

#### Styling
- **tailwindcss** `^4` - Framework CSS utility-first
- **@tailwindcss/postcss** `^4` - Plugin PostCSS pour Tailwind
- **postcss** - Outil de transformation CSS (via Tailwind)

## 🤖 Script d'Auto-insertion (auto-insert-script/)

### Dependencies

#### Web Scraping
- **axios** `^1.11.0` - Client HTTP basé sur les Promises
- **cheerio** `^1.1.2` - Implémentation côté serveur de jQuery

#### Bot Discord
- **discord.js** `^14.21.0` - Bibliothèque pour l'API Discord

#### Base de Données
- **mysql2** `^3.14.3` - Client MySQL avec support async/await

#### Traitement d'Images
- **sharp** `^0.34.3` - Traitement d'images haute performance

#### Transfert de Fichiers
- **ssh2-sftp-client** `^12.0.1` - Client SFTP pour upload de fichiers

#### Configuration
- **dotenv** `^17.2.1` - Gestion des variables d'environnement

## 🔒 Versions de Sécurité

### Vérification des Vulnérabilités
```bash
# Pour le site web
cd website && npm audit

# Pour le script
cd auto-insert-script && npm audit

# Correction automatique
npm audit fix
```

### Mise à Jour des Dépendances
```bash
# Vérifier les versions obsolètes
npm outdated

# Mise à jour interactive
npx npm-check-updates -i

# Mise à jour automatique (attention aux breaking changes)
npx npm-check-updates -u && npm install
```

## 📋 Compatibilité

### Node.js
- **Version minimale** : 18.0.0
- **Version recommandée** : 20.0.0+
- **Version testée** : 20.11.0

### Navigateurs Supportés
- **Chrome** : 90+
- **Firefox** : 88+
- **Safari** : 14+
- **Edge** : 90+

### Base de Données
- **MySQL** : 8.0+
- **MariaDB** : 10.5+ (compatible)

## 🔄 Stratégie de Mise à Jour

### Fréquence des Mises à Jour
- **Sécurité** : Immédiatement
- **Minor updates** : Mensuellement
- **Major updates** : Trimestriellement (avec tests approfondis)

### Politique de Versions
- **LTS** : Préférence pour les versions Long Term Support
- **Stable** : Éviter les versions beta/alpha en production
- **Security patches** : Application immédiate

## 🧪 Alternatives Considérées

### Framework Frontend
- **Next.js** ✅ Choisi pour SSR/SSG et API Routes
- **Nuxt.js** - Alternative Vue.js
- **SvelteKit** - Alternative légère
- **Remix** - Alternative moderne

### Base de Données
- **MySQL** ✅ Choisi pour la maturité et performance
- **PostgreSQL** - Alternative avec plus de fonctionnalités
- **MongoDB** - NoSQL alternative
- **SQLite** - Pour développement local

### Authentification
- **NextAuth.js** ✅ Choisi pour intégration Next.js
- **Auth0** - Service externe payant
- **Firebase Auth** - Solution Google
- **Supabase Auth** - Alternative open source

### CSS Framework
- **Tailwind CSS** ✅ Choisi pour flexibilité et taille
- **Bootstrap** - Alternative classique
- **Chakra UI** - Alternative avec composants
- **Ant Design** - Alternative Enterprise

## 🔍 Audit de Dépendances

### Dernière Vérification
- **Date** : 2025-08-07
- **Vulnerabilités** : 0 high, 0 moderate
- **Licenses** : Toutes MIT/Apache-2.0 compatibles

### Scripts d'Audit
```bash
# Audit complet du projet
npm run audit:full

# Vérification des licenses
npx license-checker --summary

# Analyse de la taille du bundle
npx bundle-analyzer

# Vérification des dépendances inutilisées
npx depcheck
```

## 📊 Statistiques

### Taille des Dependencies
```
website/node_modules: ~500MB
auto-insert-script/node_modules: ~150MB
Total: ~650MB
```

### Build Size (Production)
```
Next.js bundle: ~2MB gzipped
Images & assets: Variable
Total first load: ~2-5MB
```

## 🛠️ Scripts de Maintenance

### Package.json Scripts Utiles
```json
{
  "scripts": {
    "audit:full": "npm audit && cd auto-insert-script && npm audit",
    "update:check": "npm outdated && cd auto-insert-script && npm outdated",
    "update:patch": "npm update && cd auto-insert-script && npm update",
    "clean:install": "rm -rf node_modules package-lock.json && npm install",
    "deps:analyze": "npx license-checker && npx bundle-analyzer"
  }
}
```

## 📝 Notes de Migration

### Next.js 15
- Nouveau App Router stable
- Amélioration des performances SSR
- Support React 19
- Turbopack en preview

### React 19
- Nouvelles fonctionnalités de concurrence
- Server Components améliorés
- Meilleure gestion des erreurs
- Hooks optimisés

### Material-UI 6
- Nouvelle architecture CSS
- Amélioration des performances
- Support TypeScript complet
- Thèmes améliorés

---

💡 **Conseil** : Gardez ce fichier à jour après chaque modification des dépendances pour faciliter la maintenance et les audits de sécurité.
