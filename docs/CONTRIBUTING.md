# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à Watch-Anime ! Ce guide vous aidera à comprendre comment participer au développement du projet.

## 📋 Table des matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de Développement](#configuration-de-développement)  
- [Standards de Code](#standards-de-code)
- [Processus de Révision](#processus-de-révision)
- [Types de Contributions](#types-de-contributions)

## 📜 Code de Conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :

- Soyez respectueux et bienveillant
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est le mieux pour la communauté
- Faites preuve d'empathie envers les autres membres

## 🚀 Comment Contribuer

### 1. Fork et Clone
```bash
# Fork le repository sur GitHub, puis :
git clone https://github.com/VOTRE-USERNAME/Watch-Anime.git
cd Watch-Anime
```

### 2. Créer une branche
```bash
git checkout -b feature/nom-de-votre-fonctionnalite
# ou
git checkout -b fix/nom-du-bug
# ou  
git checkout -b docs/amelioration-documentation
```

### 3. Faire vos modifications
- Suivez les [standards de code](#standards-de-code)
- Testez vos modifications localement
- Ajoutez des tests si nécessaire

### 4. Commit et Push
```bash
git add .
git commit -m "feat: ajouter fonctionnalité X"
git push origin feature/nom-de-votre-fonctionnalite
```

### 5. Créer une Pull Request
- Allez sur GitHub et créez une Pull Request
- Décrivez clairement vos modifications
- Liez les issues concernées si applicable

## 🛠️ Configuration de Développement

### Prérequis
- Node.js 18+
- MySQL 8.0+
- Git

### Installation
```bash
# Installer les dépendances
cd website && npm install
cd ../auto-insert-script && npm install

# Configuration de l'environnement
cp website/.env.example website/.env
cp auto-insert-script/.env.example auto-insert-script/.env

# Configurer la base de données
mysql -u root -p < empty_database.sql

# Lancer en mode développement
cd website && npm run dev
```

### Structure des branches
- `main` : Branche principale stable
- `develop` : Branche de développement
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `hotfix/*` : Corrections urgentes
- `docs/*` : Améliorations de documentation

## 📏 Standards de Code

### Convention de nommage
```javascript
// Variables et fonctions : camelCase
const userName = 'john';
function getUserData() {}

// Composants React : PascalCase
const AnimeCard = () => {};

// Constantes : SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Fichiers : kebab-case ou PascalCase pour les composants
anime-card.tsx
AnimeCard.tsx
```

### Structure des composants React
```typescript
// AnimeCard.tsx
import React from 'react';

interface AnimeCardProps {
  anime: {
    id: number;
    nom_anime: string;
    affiche_url?: string;
  };
  onClick?: (id: number) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ 
  anime, 
  onClick 
}) => {
  return (
    <div className="anime-card">
      {/* Contenu du composant */}
    </div>
  );
};

export default AnimeCard;
```

### Structure des API Routes
```typescript
// app/api/anime/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    
    // Logique de l'API
    
    return NextResponse.json({
      animes: results,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
```

### Gestion des erreurs
```typescript
// Composant avec gestion d'erreur
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

try {
  setLoading(true);
  const response = await fetch('/api/anime/list');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  // Traitement des données
} catch (err) {
  setError(err instanceof Error ? err.message : 'Une erreur est survenue');
} finally {
  setLoading(false);
}
```

### Messages de commit

Format : `type(scope): description`

**Types :**
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage, style
- `refactor` : Refactoring
- `test` : Tests
- `chore` : Maintenance

**Exemples :**
```bash
git commit -m "feat(anime): ajouter support multi-saisons"
git commit -m "fix(player): corriger bug de progression"
git commit -m "docs(api): mettre à jour documentation endpoints"
```

## 🔍 Types de Contributions

### 🆕 Nouvelles Fonctionnalités
- Système de notifications
- Mode hors ligne
- Support d'autres lecteurs vidéo
- Amélioration des recommandations
- Interface d'administration

### 🐛 Corrections de Bugs
- Problèmes de performance
- Bugs d'affichage responsive
- Erreurs de validation de données
- Problèmes de sécurité

### 📚 Documentation
- Améliorer les README
- Ajouter des exemples de code
- Créer des tutoriels
- Documenter l'API

### 🎨 Interface Utilisateur
- Améliorer l'accessibilité
- Optimiser les performances
- Responsive design
- Thèmes sombres/clairs

### ⚡ Performance
- Optimisation des requêtes base de données
- Cache et mise en cache
- Optimisation des images
- Code splitting

## 🧪 Tests

### Tests unitaires
```bash
cd website
npm test
```

### Tests d'intégration
```bash
npm run test:integration
```

### Tests end-to-end
```bash
npm run test:e2e
```

### Écrire des tests
```typescript
// __tests__/components/AnimeCard.test.tsx
import { render, screen } from '@testing-library/react';
import AnimeCard from '../AnimeCard';

describe('AnimeCard', () => {
  const mockAnime = {
    id: 1,
    nom_anime: 'Test Anime',
    affiche_url: 'test.jpg'
  };

  it('affiche le nom de l\'anime', () => {
    render(<AnimeCard anime={mockAnime} />);
    expect(screen.getByText('Test Anime')).toBeInTheDocument();
  });
});
```

## 📋 Checklist Pull Request

Avant de soumettre votre PR, vérifiez :

- [ ] Le code suit les standards du projet
- [ ] Les tests passent (`npm test`)
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les changements sont testés localement
- [ ] Le commit message suit le format conventionnel
- [ ] Aucune information sensible n'est commitée
- [ ] Le code est compatible avec les navigateurs supportés

## 🔄 Processus de Révision

1. **Création de la PR** : Description claire, screenshots si UI
2. **Review automatique** : Tests CI/CD, linting
3. **Review par les mainteneurs** : Code, architecture, sécurité  
4. **Corrections demandées** : Adresser les commentaires
5. **Approbation** : PR approuvée par au moins 1 mainteneur
6. **Merge** : Fusion dans la branche principale

## 🏷️ Labels utilisés

- `good first issue` : Bon pour débuter
- `help wanted` : Besoin d'aide
- `bug` : Bug confirmé
- `enhancement` : Amélioration
- `documentation` : Amélioration doc
- `performance` : Optimisation
- `security` : Problème de sécurité
- `priority:high` : Priorité haute

## 💬 Communication

- **Issues GitHub** : Pour les bugs et fonctionnalités
- **Discussions** : Pour les questions générales
- **Email** : Pour les questions sensibles

## 🎯 Roadmap

Consultez nos [issues GitHub](https://github.com/ArthurAugis/Watch-Anime/issues) et [projets](https://github.com/ArthurAugis/Watch-Anime/projects) pour voir ce qui est planifié.

## 🙏 Remerciements

Merci à tous les contributeurs qui aident à améliorer Watch-Anime !

### Comment être ajouté aux contributeurs
Toute contribution significative (code, documentation, design, etc.) vous ajoute automatiquement à la liste des contributeurs.

## ❓ Questions

Si vous avez des questions :
1. Consultez cette documentation
2. Cherchez dans les issues existantes  
3. Créez une nouvelle issue ou discussion
4. Contactez les mainteneurs

---

**Rappel :** Ce projet suit les principes du logiciel libre. Vos contributions sont les bienvenues et appréciées ! 🚀
