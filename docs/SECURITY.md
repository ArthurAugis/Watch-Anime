# 🔐 Guide de Sécurité

Ce guide présente les bonnes pratiques de sécurité à suivre lors du déploiement et de l'utilisation de Watch-Anime.

## 🛡️ Sécurité générale

### Variables d'environnement
**❌ Ne jamais faire :**
```env
# Valeurs par défaut ou exemples
NEXTAUTH_SECRET=change_this_secret
DB_PASS=password123
GOOGLE_CLIENT_SECRET=your_secret_here
```

**✅ Bonnes pratiques :**
```env
# Secrets forts et uniques
NEXTAUTH_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
DB_PASS=Kj8#mN9$pQ2@vR5&wX3!zY7%
GOOGLE_CLIENT_SECRET=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45pqr
```

### Génération de secrets sécurisés
```bash
# NextAuth secret (32+ caractères)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Mot de passe base de données
openssl rand -base64 32

# Ou avec Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 🔒 Base de données

### Utilisateurs et privilèges
```sql
-- Créer un utilisateur spécifique pour l'application
CREATE USER 'watch_anime_app'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';

-- Privilèges minimaux nécessaires
GRANT SELECT, INSERT, UPDATE, DELETE ON watch_anime_db.* TO 'watch_anime_app'@'localhost';

-- PAS de privilèges administrateur
-- REVOKE CREATE, DROP, ALTER, INDEX ON *.* FROM 'watch_anime_app'@'localhost';
```

### Connexions sécurisées
```sql
-- Forcer SSL/TLS
ALTER USER 'watch_anime_app'@'localhost' REQUIRE SSL;

-- Limiter les connexions
ALTER USER 'watch_anime_app'@'localhost' WITH MAX_CONNECTIONS_PER_HOUR 1000;
```

### Chiffrement des données
```javascript
// Chiffrement des données sensibles (si nécessaire)
const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key, iv);
  // ... implémentation
}
```

## 🌐 Configuration réseau

### HTTPS obligatoire
```javascript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Rediriger HTTP vers HTTPS en production
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }
}
```

### Headers de sécurité
```javascript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};
```

## 🔐 Authentification OAuth

### Configuration sécurisée

#### Google OAuth
```env
# URLs de redirection exactes
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz01

# Domaines autorisés dans Google Cloud Console :
# - http://localhost:3000 (dev uniquement)
# - https://votre-domaine.com (production)
```

#### Discord OAuth
```env
DISCORD_CLIENT_ID=123456789012345678
DISCORD_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz0123456789

# URLs de redirection dans Discord :
# - http://localhost:3000/api/auth/callback/discord (dev)
# - https://votre-domaine.com/api/auth/callback/discord (prod)
```

### Validation des sessions
```typescript
// lib/auth.ts
import { getServerSession } from "next-auth/next";

export async function validateSession(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Session invalide');
  }
  
  // Vérifications supplémentaires
  if (session.expires && new Date() > new Date(session.expires)) {
    throw new Error('Session expirée');
  }
  
  return session;
}
```

## 🚫 Protection contre les attaques

### Injection SQL
```javascript
// ❌ Vulnérable
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Sécurisé avec requêtes préparées
const [rows] = await db.query(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

### XSS (Cross-Site Scripting)
```typescript
// ✅ Échappement automatique avec React
const UserDisplay = ({ username }: { username: string }) => (
  <div>{username}</div> // Échappé automatiquement
);

// ✅ Validation côté serveur
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().max(100).regex(/^[a-zA-Z0-9\s]+$/),
  email: z.string().email()
});
```

### CSRF (Cross-Site Request Forgery)
NextAuth.js fournit une protection CSRF automatique, mais vous pouvez ajouter :

```javascript
// lib/csrf.ts
import { NextRequest } from 'next/server';

export function validateCSRF(request: NextRequest) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  if (!origin || !referer) {
    throw new Error('Headers manquants');
  }
  
  if (new URL(origin).hostname !== new URL(referer).hostname) {
    throw new Error('CSRF detected');
  }
}
```

### Rate Limiting
```javascript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

export default function rateLimit(options: Options = {}) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (token: string, limit: number) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      tokenCount[0] += 1;

      return tokenCount[0] <= limit;
    }
  };
}

// Usage dans une API route
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function GET(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  
  if (!limiter.check(ip, 10)) { // 10 requêtes par minute
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // ... logique de l'API
}
```

## 📁 Sécurité des fichiers

### Gitignore complet
```gitignore
# Secrets et configuration
.env*
!.env.example

# Logs sensibles
*.log
logs/

# Base de données
*.db
*.sqlite
backups/

# Certificats et clés
*.pem
*.key
*.crt

# Fichiers système
.DS_Store
Thumbs.db

# Uploads utilisateur
uploads/
tmp/
```

### Permissions des fichiers
```bash
# Fichiers de configuration
chmod 600 .env*

# Scripts exécutables
chmod 755 scripts/*.sh

# Logs
chmod 644 logs/*.log
```

## 🔧 Sécurité en production

### Variables d'environnement de production
```bash
# Ne pas utiliser les valeurs par défaut
NODE_ENV=production
NEXTAUTH_URL=https://votre-domaine.com

# Secrets uniques et forts
NEXTAUTH_SECRET=$(openssl rand -hex 32)
DB_PASS=$(openssl rand -base64 32)
```

### Configuration du serveur web

#### Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.com;
    
    # SSL/TLS
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Headers de sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Limitation des requêtes
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Apache
```apache
<VirtualHost *:443>
    ServerName votre-domaine.com
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    SSLProtocol TLSv1.2 TLSv1.3
    
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

## 📊 Monitoring de sécurité

### Logs de sécurité
```javascript
// lib/security-logger.ts
export function logSecurityEvent(event: {
  type: 'login' | 'failed_login' | 'suspicious_activity';
  userId?: string;
  ip: string;
  userAgent: string;
  details?: any;
}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    ...event
  }));
  
  // Optionnel : envoyer vers un service de monitoring
}

// Usage
logSecurityEvent({
  type: 'failed_login',
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
  details: { reason: 'invalid_credentials' }
});
```

### Alertes automatiques
```javascript
// Détecter les tentatives de brute force
const failedAttempts = new Map();

function checkBruteForce(ip: string) {
  const attempts = failedAttempts.get(ip) || 0;
  if (attempts > 5) {
    // Bloquer temporairement et alerter
    sendAlert(`Brute force détecté depuis ${ip}`);
    return false;
  }
  return true;
}
```

## 🚨 Incident Response

### En cas de compromission
1. **Isoler** : Déconnecter temporairement le service
2. **Analyser** : Examiner les logs pour comprendre l'intrusion
3. **Nettoyer** : Supprimer les éléments malveillants
4. **Corriger** : Appliquer les correctifs de sécurité
5. **Restaurer** : Remettre en service avec monitoring renforcé
6. **Communiquer** : Informer les utilisateurs si nécessaire

### Sauvegarde des données
```bash
#!/bin/bash
# Script de sauvegarde sécurisé
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/secure/backups"
ENCRYPTION_KEY="/secure/keys/backup.key"

# Dump de la base de données
mysqldump -u backup_user -p watch_anime_db > backup_${DATE}.sql

# Chiffrement
gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
    --output ${BACKUP_DIR}/backup_${DATE}.sql.gpg backup_${DATE}.sql

# Nettoyage
rm backup_${DATE}.sql

# Rotation (garder 30 jours)
find ${BACKUP_DIR} -name "backup_*.sql.gpg" -mtime +30 -delete
```

## ✅ Checklist de sécurité

### Avant déploiement
- [ ] Variables d'environnement sécurisées
- [ ] HTTPS configuré
- [ ] Headers de sécurité en place
- [ ] Rate limiting activé
- [ ] Logs de sécurité configurés
- [ ] Sauvegardes automatiques
- [ ] Monitoring en place

### Maintenance régulière
- [ ] Mise à jour des dépendances
- [ ] Audit de sécurité mensuel
- [ ] Révision des permissions
- [ ] Test des sauvegardes
- [ ] Analyse des logs de sécurité

### Réponse aux incidents
- [ ] Plan d'incident documenté
- [ ] Contacts d'urgence définis
- [ ] Procédures de récupération testées
- [ ] Communication de crise préparée

---

⚠️ **Important :** La sécurité est un processus continu, pas un état final. Restez vigilant et maintenez vos systèmes à jour.
