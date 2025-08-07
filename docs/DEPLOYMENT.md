# 📚 Guide de Déploiement

Ce guide vous accompagne dans le déploiement de Watch-Anime en production sur différentes plateformes.

## 🎯 Vue d'ensemble

Watch-Anime peut être déployé sur plusieurs environnements :
- **VPS/Serveur dédié** (recommandé pour un contrôle total)
- **Vercel** (pour le frontend Next.js)
- **Railway/Render** (solution tout-en-un)
- **Docker** (containerisation)

## 🖥️ Déploiement VPS/Serveur dédié

### Prérequis serveur
- Ubuntu 20.04+ ou CentOS 8+
- 2GB RAM minimum (4GB recommandé)
- 20GB d'espace disque
- Accès root ou sudo

### 1. Préparation du serveur

#### Installation des dépendances
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Installation de Nginx
sudo apt install nginx -y

# Installation de PM2 (gestionnaire de processus)
sudo npm install -g pm2

# Installation de Certbot (SSL gratuit)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configuration de la base de données

```bash
# Connexion à MySQL
sudo mysql -u root -p

# Dans le prompt MySQL
CREATE DATABASE watch_anime_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'watch_anime_user'@'localhost' IDENTIFIED BY 'MOT_DE_PASSE_FORT';
GRANT ALL PRIVILEGES ON watch_anime_db.* TO 'watch_anime_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import du schéma
mysql -u watch_anime_user -p watch_anime_db < empty_database.sql
```

### 3. Déploiement de l'application

```bash
# Clonage du projet
git clone https://github.com/ArthurAugis/Watch-Anime.git /var/www/watch-anime
cd /var/www/watch-anime

# Configuration des permissions
sudo chown -R $USER:$USER /var/www/watch-anime

# Installation et build de l'application web
cd website
npm install
cp .env.example .env
# Éditez .env avec vos configurations de production

# Build de production
npm run build

# Configuration du script d'auto-insertion (optionnel)
cd ../auto-insert-script
npm install
cp .env.example .env
# Éditez .env avec vos configurations
```

### 4. Configuration PM2

```bash
# Création du fichier de configuration PM2
cat > /var/www/watch-anime/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'watch-anime-web',
      cwd: '/var/www/watch-anime/website',
      script: 'npm',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'watch-anime-script',
      cwd: '/var/www/watch-anime/auto-insert-script',
      script: 'index.js',
      instances: 1,
      cron_restart: '0 2 * * *', // Redémarrage quotidien à 2h
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

# Lancement avec PM2
cd /var/www/watch-anime
pm2 start ecosystem.config.js

# Sauvegarde de la configuration PM2
pm2 save
pm2 startup
```

### 5. Configuration Nginx

```bash
# Création du fichier de configuration
sudo tee /etc/nginx/sites-available/watch-anime << EOF
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection vers HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # Certificats SSL (seront générés avec Certbot)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # Configuration SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Headers de sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gestion des fichiers statiques
    location /_next/static/ {
        alias /var/www/watch-anime/website/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /images/ {
        alias /var/www/watch-anime/website/public/;
        expires 1M;
        add_header Cache-Control "public";
    }

    # Proxy vers Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Rate limiting pour l'API
    location /api/ {
        limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activation du site
sudo ln -s /etc/nginx/sites-available/watch-anime /etc/nginx/sites-enabled/

# Test de la configuration
sudo nginx -t

# Redémarrage de Nginx
sudo systemctl restart nginx
```

### 6. Configuration SSL avec Let's Encrypt

```bash
# Génération du certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajoutez cette ligne :
0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Configuration du firewall

```bash
# UFW (Ubuntu Firewall)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## ☁️ Déploiement Vercel

### 1. Préparation du projet

```bash
# Installation de Vercel CLI
npm install -g vercel

# Configuration pour Vercel
cd website
# Créez vercel.json
cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DB_HOST": "@db-host",
    "DB_USER": "@db-user", 
    "DB_PASS": "@db-pass",
    "DB_NAME": "@db-name",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret",
    "DISCORD_CLIENT_ID": "@discord-client-id",
    "DISCORD_CLIENT_SECRET": "@discord-client-secret"
  }
}
EOF
```

### 2. Déploiement

```bash
# Déploiement initial
vercel

# Configuration des variables d'environnement
vercel env add DB_HOST
vercel env add DB_USER
vercel env add DB_PASS
# ... pour chaque variable

# Déploiement en production
vercel --prod
```

## 🐳 Déploiement Docker

### 1. Dockerfile pour l'application web

```dockerfile
# website/Dockerfile
FROM node:18-alpine AS base

# Dépendances seulement
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: watch-anime-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: watch_anime_db
      MYSQL_USER: watch_anime_user
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./empty_database.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - watch-anime-network

  web:
    build: 
      context: ./website
      dockerfile: Dockerfile
    container_name: watch-anime-web
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_USER=watch_anime_user
      - DB_PASS=${MYSQL_PASSWORD}
      - DB_NAME=watch_anime_db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - mysql
    networks:
      - watch-anime-network

  auto-insert:
    build:
      context: ./auto-insert-script
      dockerfile: Dockerfile
    container_name: watch-anime-script
    restart: always
    environment:
      - NODE_ENV=production
      - db_host=mysql
      - db_user=watch_anime_user
      - db_pass=${MYSQL_PASSWORD}
    depends_on:
      - mysql
    networks:
      - watch-anime-network

  nginx:
    image: nginx:alpine
    container_name: watch-anime-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    networks:
      - watch-anime-network

volumes:
  mysql_data:

networks:
  watch-anime-network:
    driver: bridge
```

### 3. Variables d'environnement Docker

```bash
# .env.docker
MYSQL_ROOT_PASSWORD=root_password_very_strong
MYSQL_PASSWORD=user_password_very_strong
NEXTAUTH_SECRET=your_nextauth_secret_32_chars_min
NEXTAUTH_URL=https://votre-domaine.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

### 4. Lancement Docker

```bash
# Build et lancement
docker-compose --env-file .env.docker up -d

# Vérification des logs
docker-compose logs -f

# Mise à jour
docker-compose pull
docker-compose up -d
```

## 🔄 Mise en production

### Checklist de pré-déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée
- [ ] Certificats SSL configurés
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring configuré
- [ ] Tests de charge effectués
- [ ] Plan de rollback préparé

### Tests de production

```bash
# Test de connectivité
curl -I https://votre-domaine.com

# Test des endpoints API
curl https://votre-domaine.com/api/anime/list

# Test de la base de données
mysql -u watch_anime_user -p -e "SELECT COUNT(*) FROM watch_anime_db.tab_liste_anime;"
```

### Surveillance et maintenance

#### Scripts de monitoring

```bash
#!/bin/bash
# monitoring.sh

# Vérification du service
if ! pgrep -f "next" > /dev/null; then
    echo "Service Watch-Anime arrêté, redémarrage..."
    pm2 restart watch-anime-web
fi

# Vérification de l'espace disque
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Attention: Espace disque faible ($DISK_USAGE%)"
fi

# Vérification de la mémoire
MEM_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEM_USAGE > 90" | bc -l) )); then
    echo "Attention: Utilisation mémoire élevée ($MEM_USAGE%)"
fi
```

#### Crontab de maintenance

```bash
# Edition du crontab
crontab -e

# Ajout des tâches
# Monitoring toutes les 5 minutes
*/5 * * * * /path/to/monitoring.sh

# Sauvegarde quotidienne à 2h
0 2 * * * /path/to/backup.sh

# Nettoyage des logs hebdomadaire
0 3 * * 0 find /var/log -name "*.log" -mtime +7 -delete

# Mise à jour des certificats SSL
0 4 1 * * certbot renew --quiet
```

## 📊 Surveillance et Logs

### Configuration des logs

```javascript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Métriques importantes

- Temps de réponse API
- Utilisation de la base de données  
- Taux d'erreur
- Utilisation des ressources
- Nombre d'utilisateurs actifs

## 🚨 Plan de reprise d'activité

### Sauvegarde

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/watch-anime"

# Base de données
mysqldump -u watch_anime_user -p watch_anime_db > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql

# Fichiers de l'application
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/watch-anime

# Nettoyage (garder 7 jours)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

### Restauration

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Arrêt des services
pm2 stop all

# Restauration de la base de données
zcat $BACKUP_FILE | mysql -u watch_anime_user -p watch_anime_db

# Redémarrage des services
pm2 start all
```

---

🎉 **Félicitations !** Votre installation de Watch-Anime est maintenant déployée en production. N'oubliez pas de surveiller régulièrement les performances et de maintenir le système à jour.
