# 📊 Documentation de la Base de Données

## Vue d'ensemble

Le projet Watch-Anime utilise MySQL 8.0+ avec un schéma optimisé pour le streaming d'animés. La base de données gère les utilisateurs, le catalogue d'animés, l'historique de visionnage et les préférences.

## Schema de Base de Données

### Tables Principales

#### `tab_liste_anime` - Catalogue des animés
```sql
CREATE TABLE tab_liste_anime (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_anime VARCHAR(255) NOT NULL,
  nom_url VARCHAR(255) UNIQUE NOT NULL,
  affiche_url TEXT,
  description TEXT,
  note DECIMAL(3,1),
  annee YEAR,
  statut ENUM('en_cours', 'termine', 'a_venir') DEFAULT 'en_cours',
  genre VARCHAR(500),
  studio VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `tab_episodes` - Episodes et liens
```sql
CREATE TABLE tab_episodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anime_id INT NOT NULL,
  numero_episode INT NOT NULL,
  nom_episode VARCHAR(255),
  saison INT DEFAULT 1,
  langue ENUM('vf', 'vostfr', 'vo') NOT NULL,
  lecteur VARCHAR(50) NOT NULL,
  lien TEXT NOT NULL,
  qualite ENUM('360p', '480p', '720p', '1080p') DEFAULT '720p',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (anime_id) REFERENCES tab_liste_anime(id) ON DELETE CASCADE,
  INDEX idx_anime_episode (anime_id, numero_episode, saison),
  INDEX idx_langue (langue)
);
```

#### `users` - Utilisateurs authentifiés
```sql
CREATE TABLE users (
  id VARCHAR(21) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  image TEXT,
  provider ENUM('google', 'discord') NOT NULL,
  providerId VARCHAR(255) UNIQUE NOT NULL,
  admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_provider (provider, providerId)
);
```

#### `user_history` - Historique de visionnage
```sql
CREATE TABLE user_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(21) NOT NULL,
  anime_id INT NOT NULL,
  episode_number INT NOT NULL,
  saison INT DEFAULT 1,
  progression INT DEFAULT 0, -- en secondes
  duree_totale INT DEFAULT 0, -- en secondes  
  termine BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (anime_id) REFERENCES tab_liste_anime(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_episode (user_id, anime_id, episode_number, saison),
  INDEX idx_user_recent (user_id, watched_at),
  INDEX idx_anime (anime_id)
);
```

#### `user_likes` - Favoris utilisateurs
```sql
CREATE TABLE user_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(21) NOT NULL,
  anime_id INT NOT NULL,
  liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (anime_id) REFERENCES tab_liste_anime(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_like (user_id, anime_id),
  INDEX idx_user (user_id),
  INDEX idx_anime (anime_id)
);
```

#### `user_watchlater` - À regarder plus tard
```sql
CREATE TABLE user_watchlater (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(21) NOT NULL,
  anime_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (anime_id) REFERENCES tab_liste_anime(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_watchlater (user_id, anime_id),
  INDEX idx_user (user_id),
  INDEX idx_anime (anime_id)
);
```

#### `changelogs` - Journal des modifications
```sql
CREATE TABLE changelogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(20) NOT NULL,
  date_release DATE NOT NULL,
  contenu TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Requêtes Fréquentes

### Récupération du catalogue
```sql
-- Liste des animés avec statistiques
SELECT 
  a.*,
  COUNT(DISTINCT e.numero_episode) as nb_episodes,
  COUNT(DISTINCT ul.user_id) as nb_likes,
  AVG(a.note) as note_moyenne
FROM tab_liste_anime a
LEFT JOIN tab_episodes e ON a.id = e.anime_id
LEFT JOIN user_likes ul ON a.id = ul.anime_id
GROUP BY a.id
ORDER BY a.created_at DESC
LIMIT 20;
```

### Historique utilisateur
```sql
-- Derniers épisodes regardés par un utilisateur
SELECT 
  a.nom_anime,
  a.nom_url,
  a.affiche_url,
  h.episode_number,
  h.saison,
  h.progression,
  h.duree_totale,
  h.watched_at
FROM user_history h
JOIN tab_liste_anime a ON h.anime_id = a.id
WHERE h.user_id = ?
ORDER BY h.watched_at DESC
LIMIT 10;
```

### Recommandations
```sql
-- Animés similaires basés sur les genres
SELECT DISTINCT 
  a2.*,
  COUNT(ul.user_id) as popularite
FROM tab_liste_anime a1
JOIN tab_liste_anime a2 ON (
  a2.id != a1.id AND
  (a2.genre LIKE CONCAT('%', SUBSTRING_INDEX(a1.genre, ',', 1), '%') OR
   a2.studio = a1.studio OR
   a2.annee = a1.annee)
)
LEFT JOIN user_likes ul ON a2.id = ul.anime_id
WHERE a1.id = ?
GROUP BY a2.id
ORDER BY popularite DESC, a2.note DESC
LIMIT 5;
```

### Statistiques
```sql
-- Statistiques globales du site
SELECT 
  (SELECT COUNT(*) FROM tab_liste_anime) as total_animes,
  (SELECT COUNT(*) FROM tab_episodes) as total_episodes,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM user_history WHERE watched_at > DATE_SUB(NOW(), INTERVAL 7 DAY)) as vues_semaine;
```

## Optimisation et Index

### Index recommandés
```sql
-- Performance pour les recherches fréquentes
CREATE INDEX idx_anime_search ON tab_liste_anime(nom_anime, genre, annee);
CREATE INDEX idx_episode_streaming ON tab_episodes(anime_id, numero_episode, langue, lecteur);
CREATE INDEX idx_user_activity ON user_history(user_id, watched_at DESC);
CREATE INDEX idx_popularity ON user_likes(anime_id, liked_at);

-- Index composite pour les requêtes complexes
CREATE INDEX idx_anime_stats ON tab_liste_anime(statut, annee, note DESC);
CREATE INDEX idx_episode_complete ON tab_episodes(anime_id, saison, numero_episode, langue);
```

### Requêtes d'optimisation
```sql
-- Nettoyage de l'historique ancien (> 1 an)
DELETE FROM user_history 
WHERE watched_at < DATE_SUB(NOW(), INTERVAL 1 YEAR) 
AND termine = FALSE 
AND progression < 60; -- moins d'1 minute regardée

-- Mise à jour des statistiques des animés
UPDATE tab_liste_anime a
SET note = (
  SELECT AVG(
    CASE 
      WHEN h.termine = TRUE THEN 5.0
      WHEN h.progression > h.duree_totale * 0.8 THEN 4.0
      WHEN h.progression > h.duree_totale * 0.5 THEN 3.0
      ELSE 2.0
    END
  )
  FROM user_history h 
  WHERE h.anime_id = a.id
  AND h.watched_at > DATE_SUB(NOW(), INTERVAL 6 MONTH)
)
WHERE id IN (SELECT DISTINCT anime_id FROM user_history);
```

## Sauvegarde et Maintenance

### Script de sauvegarde
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u watch_anime_user -p watch_anime_db > backup_${DATE}.sql
gzip backup_${DATE}.sql
# Garder seulement les 30 dernières sauvegardes
find /path/to/backups -name "backup_*.sql.gz" -mtime +30 -delete
```

### Maintenance régulière
```sql
-- Optimisation des tables (à exécuter hebdomadairement)
OPTIMIZE TABLE tab_liste_anime, tab_episodes, user_history, user_likes, user_watchlater;

-- Réparation des tables si nécessaire
REPAIR TABLE tab_liste_anime, tab_episodes;

-- Mise à jour des statistiques
ANALYZE TABLE tab_liste_anime, tab_episodes, user_history;
```

## Sécurité

### Utilisateur de base de données
```sql
-- Créer un utilisateur avec privilèges limités pour l'application
CREATE USER 'watch_anime_app'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
GRANT SELECT, INSERT, UPDATE, DELETE ON watch_anime_db.* TO 'watch_anime_app'@'localhost';
-- Pas de privilèges DROP, ALTER, CREATE

-- Utilisateur de lecture seule pour les rapports
CREATE USER 'watch_anime_readonly'@'localhost' IDENTIFIED BY 'autre_mot_de_passe';
GRANT SELECT ON watch_anime_db.* TO 'watch_anime_readonly'@'localhost';
```

### Chiffrement des données sensibles
```sql
-- Les mots de passe ne sont jamais stockés (OAuth uniquement)
-- Les emails peuvent être hashés pour plus de sécurité
ALTER TABLE users ADD COLUMN email_hash VARCHAR(64);
-- UPDATE users SET email_hash = SHA2(email, 256);
```

## Migration et Évolution

### Exemple de migration
```sql
-- Migration v1.1 : Ajout du support multi-saisons
ALTER TABLE tab_episodes ADD COLUMN saison INT DEFAULT 1;
CREATE INDEX idx_saison ON tab_episodes(anime_id, saison, numero_episode);

-- Migration v1.2 : Ajout de la qualité vidéo
ALTER TABLE tab_episodes ADD COLUMN qualite ENUM('360p', '480p', '720p', '1080p') DEFAULT '720p';
```

### Scripts de migration
Créez des scripts versionnés dans `database/migrations/` :
- `001_initial_schema.sql`
- `002_add_seasons.sql` 
- `003_add_quality.sql`

Chaque script doit être idempotent et inclure des vérifications :
```sql
-- Vérifier si la colonne existe avant de l'ajouter
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tab_episodes' AND COLUMN_NAME = 'saison';

SET @sql = IF(@col_exists = 0, 'ALTER TABLE tab_episodes ADD COLUMN saison INT DEFAULT 1', 'SELECT "Column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```
