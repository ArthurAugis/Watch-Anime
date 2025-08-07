# 📝 Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet respecte le [Versioning Sémantique](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-07

### ✨ Ajouté - Première version Open Source
- **Site web complet** avec Next.js 15 et TypeScript
- **Authentification OAuth** (Google, Discord) avec NextAuth.js
- **Base de données MySQL** avec schéma complet
- **API REST** complète pour la gestion des animés
- **Interface utilisateur responsive** avec Tailwind CSS
- **Script d'auto-insertion** pour l'automatisation
- **Bot Discord** pour l'administration
- **Gestion des affiches** avec upload SFTP
- **Système de favoris** et historique utilisateur
- **Watch Later** et recommandations
- **Documentation complète** avec guides d'installation

### 🛡️ Sécurisé pour l'Open Source
- Suppression de toutes les URLs et credentials sensibles
- Variables d'environnement pour toute la configuration
- Fichiers `.env.example` pour chaque composant
- Guide de sécurité complet
- Configuration Docker prête

### 📚 Documentation
- `README.md` principal avec vue d'ensemble
- `INSTALLATION.md` - Guide d'installation détaillé
- `API.md` - Documentation complète de l'API
- `DATABASE.md` - Schéma et requêtes de base de données
- `DEPLOYMENT.md` - Guide de déploiement production
- `SECURITY.md` - Bonnes pratiques de sécurité
- `CONTRIBUTING.md` - Guide de contribution
- `AUTO-INSERT-SCRIPT.md` - Documentation du script

### 🏗️ Architecture
- **Frontend** : Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, MySQL, NextAuth.js
- **Authentification** : OAuth Google/Discord, sessions sécurisées
- **Base de données** : MySQL 8.0+ avec relations optimisées
- **Upload** : Sharp pour traitement d'images, SFTP pour CDN
- **Monitoring** : Logs structurés, gestion d'erreurs

### 🎨 Interface Utilisateur
- Design moderne et responsive
- Support mobile complet
- Navigation intuitive
- Player vidéo intégré avec Plyr
- Carousel d'animés en vedette
- Système de recherche et filtres

### 🔧 Fonctionnalités Techniques
- Server-Side Rendering (SSR)
- API Routes sécurisées avec validation
- Rate limiting et protection CSRF
- Optimisation des images automatique
- Cache intelligent des requêtes
- Gestion des erreurs globale

### 🤖 Automatisation
- Script de scraping configurable
- Bot Discord pour administration
- Upload automatique d'affiches
- Détection de nouvelles langues
- Notifications en temps réel

## [Unreleased] - Fonctionnalités plannifiées

### 🎯 À venir
- **Progressive Web App (PWA)** pour installation mobile
- **Mode hors ligne** avec service worker
- **Notifications push** pour nouveaux épisodes
- **Système de commentaires** et notes utilisateur
- **API publique** avec authentification par clés
- **Thème sombre/clair** personnalisable
- **Support multi-langues** (i18n)
- **Analytics** et statistiques d'utilisation
- **Plugin système** pour sources externes
- **Mobile app** React Native

### 🔄 Améliorations prévues
- **Performance** : Optimisation des requêtes DB
- **Sécurité** : Audit sécurité complet
- **UX** : Amélioration de l'interface mobile
- **Admin** : Panel d'administration web
- **Tests** : Couverture de tests complète
- **CI/CD** : Pipeline de déploiement automatisé

## Types de changements
- `✨ Ajouté` pour les nouvelles fonctionnalités
- `🔄 Modifié` pour les changements aux fonctionnalités existantes  
- `🐛 Corrigé` pour les corrections de bugs
- `🗑️ Supprimé` pour les fonctionnalités supprimées
- `🛡️ Sécurité` pour les correctifs de sécurité
- `📚 Documentation` pour les changements de documentation
- `🏗️ Architecture` pour les changements d'infrastructure

## Migration Guides

### De version privée vers 1.0.0 Open Source

Si vous migrez depuis une version privée :

1. **Sauvegardez vos données** avant la migration
2. **Mettez à jour les variables d'environnement** :
   ```bash
   # Anciennes variables
   OLD_DB_NAME -> DB_NAME
   # Nouvelles variables requises
   NEXTAUTH_SECRET=votre_secret_32_caracteres
   ```
3. **Mettez à jour la configuration OAuth** avec les nouvelles URLs
4. **Réimportez le schéma de base de données** si nécessaire
5. **Testez toutes les fonctionnalités** avant mise en production

### Breaking Changes 1.0.0

- **Variables d'environnement** : Format standardisé
- **Base de données** : Nouvelle structure des tables utilisateurs
- **API** : Endpoints normalisés avec validation
- **Authentification** : Migration vers NextAuth.js

## Contribution

Pour contribuer au changelog :

1. Suivez le format [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
2. Ajoutez vos changements dans la section `[Unreleased]`
3. Utilisez les émojis appropriés pour chaque type de changement
4. Décrivez clairement l'impact utilisateur
5. Mentionnez les breaking changes si applicable

## Versioning

Ce projet utilise le [Versioning Sémantique](https://semver.org/spec/v2.0.0.html) :

- **MAJOR** : changements incompatibles de l'API
- **MINOR** : nouvelles fonctionnalités compatibles  
- **PATCH** : corrections de bugs compatibles

Format : `MAJOR.MINOR.PATCH` (ex: 1.2.3)

## Support

- **Issues** : [GitHub Issues](https://github.com/ArthurAugis/Watch-Anime/issues)
- **Discussions** : [GitHub Discussions](https://github.com/ArthurAugis/Watch-Anime/discussions)
- **Wiki** : [Documentation Wiki](https://github.com/ArthurAugis/Watch-Anime/wiki)
