-- phpMyAdmin SQL Dump
-- version 5.2.1deb1+deb12u1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : jeu. 07 août 2025 à 14:20
-- Version du serveur : 10.11.11-MariaDB-0+deb12u1
-- Version de PHP : 8.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `watch_anime_db`
--
CREATE DATABASE IF NOT EXISTS `watch_anime_db` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `watch_anime_db`;

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`watch_anime_user`@`%` PROCEDURE `addChangeLog` (IN `_ajouts` TEXT, IN `_auteur` VARCHAR(255))   BEGIN

INSERT INTO changelogs(changelogs.codeChangeLog, changelogs.auteur) VALUES (_ajouts, _auteur);

END$$

CREATE DEFINER=`watch_anime_user`@`%` PROCEDURE `deleteChangeLog` (IN `_id` INT)   BEGIN

DELETE FROM `changelogs` WHERE id = _id;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getallhistory` (IN `_history` JSON, IN `_limit` INT, IN `_offset` INT)   BEGIN
    -- Table temporaire avec un index d'ordre
    CREATE TEMPORARY TABLE temp_history (
        idx INT,
        nom_anime VARCHAR(255),
        nom_langue VARCHAR(100),
        nom_saison VARCHAR(100),
        nom_episode VARCHAR(100)
    );

    -- Parser JSON avec ordre implicite
    INSERT INTO temp_history (idx, nom_anime, nom_langue, nom_saison, nom_episode)
    SELECT 
        jt.idx,
        jt.nom_anime,
        jt.nom_langue,
        jt.nom_saison,
        jt.nom_episode
    FROM JSON_TABLE(
        _history,
        '$[*]' COLUMNS (
            idx FOR ORDINALITY,
            nom_anime VARCHAR(255) PATH '$.nom_anime',
            nom_langue VARCHAR(100) PATH '$.nom_langue',
            nom_saison VARCHAR(100) PATH '$.nom_saison',
            nom_episode VARCHAR(100) PATH '$.nom_episode'
        )
    ) AS jt;

    -- Résultat avec ORDER BY idx pour conserver l'ordre d'origine
    SELECT 
        tab_episodes.nom AS nom_episode,
        tab_episodes.nom_url AS nom_episode_url,
        tab_saisons.nom AS nom_saison,
        tab_saisons.nom_url AS nom_saison_url,
        tab_liste_anime.nom AS nom_anime,
        tab_liste_anime.nom_url AS nom_anime_url,
        tab_liste_anime.affiche_url,
        tab_langues.nom AS nom_langue
    FROM tab_episodes
    INNER JOIN tab_saisons ON tab_episodes.saison = tab_saisons.id
    INNER JOIN tab_liste_anime ON tab_liste_anime.id = tab_saisons.anime
    INNER JOIN tab_langues ON tab_episodes.langue = tab_langues.id
    INNER JOIN temp_history th 
        ON tab_liste_anime.nom_url = th.nom_anime
        AND tab_saisons.nom_url = th.nom_saison
        AND tab_episodes.nom_url = th.nom_episode
        AND tab_langues.nom = th.nom_langue
    ORDER BY th.idx
    LIMIT _limit OFFSET _offset;

    DROP TEMPORARY TABLE IF EXISTS temp_history;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getallhistory_user` (IN `_user` VARCHAR(255), IN `_limit` INT, IN `_offset` INT)   BEGIN

SELECT 
        tab_episodes.nom as "nom_episode",
        tab_episodes.nom_url as "nom_episode_url",
        tab_saisons.nom as "nom_saison",
        tab_saisons.nom_url as "nom_saison_url",
        tab_liste_anime.nom as "nom_anime",
        tab_liste_anime.nom_url as "nom_anime_url",
        tab_liste_anime.affiche_url as "affiche_url",
        tab_langues.nom as "nom_langue"
    FROM history
    INNER JOIN tab_episodes ON history.episode = tab_episodes.id
    INNER JOIN tab_saisons ON tab_episodes.saison = tab_saisons.id
    INNER JOIN tab_liste_anime ON tab_liste_anime.id = tab_saisons.anime
    INNER JOIN tab_langues ON tab_episodes.langue = tab_langues.id
    WHERE history.user = _user
    ORDER BY history.date DESC
    LIMIT _limit OFFSET _offset;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getanimehistory_base` (IN `nom_anime` VARCHAR(300), IN `user` VARCHAR(255))   BEGIN

SELECT 
tab_liste_anime.nom_url AS 'nom_anime', 
tab_langues.nom AS 'nom_langue', 
tab_saisons.nom_url AS 'nom_saison', 
tab_episodes.nom_url AS 'nom_episode'
FROM history
INNER JOIN tab_episodes ON history.episode = tab_episodes.id
INNER JOIN tab_saisons ON tab_episodes.saison = tab_saisons.id
INNER JOIN tab_liste_anime ON tab_liste_anime.id = tab_saisons.anime
INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
WHERE history.user = user
AND tab_liste_anime.nom_url = nom_anime
ORDER BY history.date DESC
LIMIT 1;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getanimehistory_langue` (IN `nom_anime` VARCHAR(300), IN `user` VARCHAR(255), IN `nom_langue` VARCHAR(255))   BEGIN
    SELECT 
        tab_liste_anime.nom_url AS 'nom_anime', 
        tab_langues.nom AS 'nom_langue', 
        tab_saisons.nom_url AS 'nom_saison', 
        tab_episodes.nom_url AS 'nom_episode'
    FROM history
    INNER JOIN tab_episodes ON history.episode = tab_episodes.id
    INNER JOIN tab_saisons ON tab_episodes.saison = tab_saisons.id
    INNER JOIN tab_liste_anime ON tab_liste_anime.id = tab_saisons.anime
    INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
    WHERE history.user = user
    AND tab_liste_anime.nom_url = nom_anime
    AND tab_langues.nom = nom_langue
    ORDER BY history.date DESC
    LIMIT 1;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getanimehistory_saison` (IN `nom_anime` VARCHAR(300), IN `user` VARCHAR(255), IN `nom_langue` VARCHAR(255), IN `nom_saison` VARCHAR(255))   BEGIN
    SELECT 
        tab_liste_anime.nom_url AS 'nom_anime', 
        tab_langues.nom AS 'nom_langue', 
        tab_saisons.nom_url AS 'nom_saison', 
        tab_episodes.nom_url AS 'nom_episode'
    FROM history
    INNER JOIN tab_episodes ON history.episode = tab_episodes.id
    INNER JOIN tab_saisons ON tab_episodes.saison = tab_saisons.id
    INNER JOIN tab_liste_anime ON tab_liste_anime.id = tab_saisons.anime
    INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
    WHERE history.user = user
    AND tab_liste_anime.nom_url = nom_anime
    AND tab_langues.nom = nom_langue
    AND tab_saisons.nom_url = nom_saison
    ORDER BY history.date DESC
    LIMIT 1;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getanimes` (IN `p_limit` INT, IN `p_offset` INT)   BEGIN
    -- Table temporaire pour stocker les saisons max par langue (par épisodes)
    CREATE TEMPORARY TABLE temp_MaxSaisonsLangue AS 
    SELECT 
        tab_liste_anime.id AS anime_id,
        tab_langues.nom AS langue_anime,
        COUNT(DISTINCT tab_saisons.id) AS saisons_anime
    FROM 
        tab_liste_anime
    INNER JOIN tab_saisons ON tab_liste_anime.id = tab_saisons.anime
    INNER JOIN tab_episodes ON tab_episodes.saison = tab_saisons.id
    INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
    GROUP BY tab_liste_anime.id, tab_langues.nom;

    -- Table temporaire pour stocker les épisodes max par langue
    CREATE TEMPORARY TABLE temp_MaxEpisodesLangue AS 
    SELECT 
        tab_liste_anime.id AS anime_id,
        tab_langues.nom AS langue_anime,
        COUNT(tab_episodes.id) AS episodes_anime
    FROM 
        tab_liste_anime
    INNER JOIN tab_saisons ON tab_liste_anime.id = tab_saisons.anime
    INNER JOIN tab_episodes ON tab_episodes.saison = tab_saisons.id
    INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
    GROUP BY tab_liste_anime.id, tab_langues.nom;

    -- Table temporaire pour stocker les animes à afficher en fonction de la pagination
    CREATE TEMPORARY TABLE temp_anime_ids AS 
    SELECT DISTINCT tab_liste_anime.id 
    FROM tab_liste_anime
    ORDER BY tab_liste_anime.nom ASC
    LIMIT p_limit OFFSET p_offset;

    -- Récupérer les animes avec toutes leurs infos regroupées
    SELECT 
        la.nom AS nom_anime,
        la.nom_url AS nom_url_anime,
        la.affiche_url AS affiche_anime,
        (SELECT GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ') 
         FROM tab_categoriser ca 
         INNER JOIN tab_categories c ON ca.categorie = c.id
         WHERE ca.anime = la.id) AS categorie_anime,
        (SELECT GROUP_CONCAT(DISTINCT l.nom ORDER BY l.nom SEPARATOR ', ') 
         FROM tab_episodes e
         INNER JOIN tab_langues l ON e.langue = l.id
         INNER JOIN tab_saisons s ON e.saison = s.id
         WHERE s.anime = la.id) AS langue_anime,
        (SELECT GROUP_CONCAT(DISTINCT s.subname ORDER BY s.subname SEPARATOR ', ') 
         FROM tab_subname s
         WHERE s.anime = la.id) AS subname_anime,
        (SELECT MAX(ms.saisons_anime) 
         FROM temp_MaxSaisonsLangue ms 
         WHERE ms.anime_id = la.id) AS saisons_anime,
        (SELECT MAX(me.episodes_anime) 
         FROM temp_MaxEpisodesLangue me 
         WHERE me.anime_id = la.id) AS episodes_anime
    FROM 
        tab_liste_anime la
    WHERE 
        la.id IN (SELECT id FROM temp_anime_ids)
    ORDER BY la.nom ASC;

    -- Supprimer les tables temporaires pour libérer la mémoire
    DROP TEMPORARY TABLE IF EXISTS temp_MaxSaisonsLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_MaxEpisodesLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_anime_ids;
END$$

CREATE DEFINER=`watch_anime_user`@`%` PROCEDURE `getChangeLogs` (IN `p_limit` INT, IN `p_offset` INT)   BEGIN
  SELECT changelogs.codeChangeLog, users.name, changelogs.date, changelogs.id
  FROM changelogs
  INNER JOIN users ON users.id = changelogs.auteur
  LIMIT p_offset, p_limit;
END$$

CREATE DEFINER=`watch_anime_user`@`%` PROCEDURE `getCosmeticsShop` (IN `_user` VARCHAR(255), IN `_limit` INT, IN `_offset` INT, IN `_type` VARCHAR(255), IN `_keyword` VARCHAR(255))   BEGIN

-- Gestion des valeurs par défaut
SET _limit = IFNULL(_limit, 20);
SET _offset = IFNULL(_offset, 0);

SELECT cosmetics.id, cosmetics.nom, cosmetics.type, cosmetics.background_color, cosmetics.container_color, cosmetics.text_color, cosmetics.action_color, cosmetics.background_image, cosmetics.profile_decoration, cosmetics.banner, cosmetics.unlock_condition, cosmetics.unlock_code, cosmetics.description, cosmetics.rarity, cosmetics.is_active
FROM cosmetics
WHERE (_type IS NULL OR _type = '' OR cosmetics.type = _type)
    AND (_keyword IS NULL OR _keyword = '' OR 
         cosmetics.nom LIKE CONCAT('%', _keyword, '%') OR 
         cosmetics.description LIKE CONCAT('%', _keyword, '%'))
    AND cosmetics.is_active = 1
ORDER BY cosmetics.created_at DESC
LIMIT _limit OFFSET _offset;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getlikes` (IN `p_likedAnimesJSON` JSON, IN `p_offset` INT, IN `p_limit` INT)   BEGIN
    -- Tables temporaires pour langues et saisons
    CREATE TEMPORARY TABLE temp_MaxSaisonsLangue AS 
    SELECT 
        a.id AS anime_id,
        l.nom AS langue_anime,
        COUNT(DISTINCT s.id) AS saisons_anime
    FROM 
        tab_liste_anime a
    INNER JOIN tab_saisons s ON a.id = s.anime
    INNER JOIN tab_episodes e ON e.saison = s.id
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY a.id, l.nom;

    CREATE TEMPORARY TABLE temp_anime_ids AS 
    SELECT a.id
    FROM tab_liste_anime a
    INNER JOIN JSON_TABLE(
        p_likedAnimesJSON,
        '$[*]' COLUMNS(nom_url VARCHAR(255) PATH '$')
    ) AS likes_json
    ON a.nom_url = likes_json.nom_url
    LIMIT p_offset, p_limit;

    SELECT 
        a.nom_url,
        a.nom AS nom_anime,
        a.affiche_url AS affiche_anime,
        (SELECT GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ')
         FROM tab_categoriser ca
         INNER JOIN tab_categories c ON ca.categorie = c.id
         WHERE ca.anime = a.id) AS categorie_anime,
        (SELECT GROUP_CONCAT(DISTINCT l.nom ORDER BY l.nom SEPARATOR ', ')
         FROM tab_episodes e
         INNER JOIN tab_langues l ON e.langue = l.id
         INNER JOIN tab_saisons s ON e.saison = s.id
         WHERE s.anime = a.id) AS langue_anime,
        (SELECT GROUP_CONCAT(DISTINCT s.subname ORDER BY s.subname SEPARATOR ', ')
         FROM tab_subname s
         WHERE s.anime = a.id) AS subname_anime,
        (SELECT MAX(ms.saisons_anime)
         FROM temp_MaxSaisonsLangue ms
         WHERE ms.anime_id = a.id) AS saisons_anime
    FROM 
        tab_liste_anime a
    WHERE 
        a.id IN (SELECT id FROM temp_anime_ids)
    ORDER BY a.nom ASC;

    -- Clean-up
    DROP TEMPORARY TABLE IF EXISTS temp_MaxSaisonsLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_anime_ids;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getmostlike` (IN `p_limit` INT, IN `p_offset` INT)   BEGIN
    WITH 
    MaxSaisonsLangue AS (
        SELECT 
            la.id AS anime_id,
            l.nom AS langue_anime,
            COUNT(DISTINCT s.id) AS saisons_anime
        FROM tab_liste_anime la
        INNER JOIN tab_saisons s ON la.id = s.anime
        INNER JOIN tab_episodes e ON e.saison = s.id
        INNER JOIN tab_langues l ON l.id = e.langue
        GROUP BY la.id, l.nom
    ),
    MaxEpisodesLangue AS (
        SELECT 
            la.id AS anime_id,
            l.nom AS langue_anime,
            COUNT(e.id) AS episodes_anime
        FROM tab_liste_anime la
        INNER JOIN tab_saisons s ON la.id = s.anime
        INNER JOIN tab_episodes e ON e.saison = s.id
        INNER JOIN tab_langues l ON l.id = e.langue
        GROUP BY la.id, l.nom
    ),
    BestLangueSaisons AS (
        SELECT 
            anime_id,
            MAX(saisons_anime) AS saisons_anime
        FROM MaxSaisonsLangue
        GROUP BY anime_id
    ),
    BestLangueEpisodes AS (
        SELECT 
            anime_id,
            MAX(episodes_anime) AS episodes_anime
        FROM MaxEpisodesLangue
        GROUP BY anime_id
    ),
    TopLikedAnimes AS (
        SELECT 
            la.id AS anime_id,
            COUNT(a.user) AS like_count
        FROM tab_liste_anime la 
        LEFT JOIN likes a ON la.id = a.anime
        GROUP BY la.id 
        HAVING COUNT(a.user) > 0 
        ORDER BY like_count DESC 
        LIMIT p_limit OFFSET p_offset
    )
    
    SELECT 
        la.id AS anime_id,
        la.nom AS nom_anime,
        la.nom_url AS nom_url_anime,
        la.affiche_url AS affiche_anime,
        (SELECT GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ') 
         FROM tab_categoriser tc 
         INNER JOIN tab_categories c ON tc.categorie = c.id 
         WHERE tc.anime = la.id) AS categorie_anime,
        (SELECT GROUP_CONCAT(DISTINCT l.nom ORDER BY l.nom SEPARATOR ', ') 
         FROM tab_episodes e
         INNER JOIN tab_langues l ON e.langue = l.id
         INNER JOIN tab_saisons s ON e.saison = s.id
         WHERE s.anime = la.id) AS langue_anime,
        (SELECT GROUP_CONCAT(DISTINCT s.subname ORDER BY s.subname SEPARATOR ', ') 
         FROM tab_subname s 
         WHERE s.anime = la.id) AS subname_anime,
        bsl.saisons_anime,
        ble.episodes_anime,
        tla.like_count
    FROM tab_liste_anime la
    INNER JOIN TopLikedAnimes tla ON la.id = tla.anime_id
    LEFT JOIN BestLangueSaisons bsl ON la.id = bsl.anime_id
    LEFT JOIN BestLangueEpisodes ble ON la.id = ble.anime_id
    ORDER BY tla.like_count DESC, la.id;
    
END$$

CREATE DEFINER=`watch_anime_user`@`%` PROCEDURE `getuser` (IN `_username` VARCHAR(255))   BEGIN

SELECT * FROM users WHERE users.username = _username;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getuserlikes` (IN `p_user` VARCHAR(255), IN `p_offset` INT, IN `p_limit` INT)   BEGIN
    -- Table temporaire : nombre de saisons par langue (via tab_episodes)
    CREATE TEMPORARY TABLE temp_MaxSaisonsLangue AS 
    SELECT 
        a.id AS anime_id,
        l.nom AS langue_anime,
        COUNT(DISTINCT s.id) AS saisons_anime
    FROM 
        tab_liste_anime a
    INNER JOIN tab_saisons s ON a.id = s.anime
    INNER JOIN tab_episodes e ON e.saison = s.id
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY a.id, l.nom;

    -- Table temporaire : nombre d'épisodes par langue
    CREATE TEMPORARY TABLE temp_MaxEpisodesLangue AS 
    SELECT 
        a.id AS anime_id,
        l.nom AS langue_anime,
        COUNT(e.id) AS episodes_anime
    FROM 
        tab_liste_anime a
    INNER JOIN tab_saisons s ON a.id = s.anime
    INNER JOIN tab_episodes e ON s.id = e.saison
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY a.id, l.nom;

    -- Table temporaire : liste des animes likés par l'utilisateur avec pagination
    CREATE TEMPORARY TABLE temp_user_liked_animes AS 
    SELECT a.id
    FROM likes l
    INNER JOIN tab_liste_anime a ON l.anime = a.id
    WHERE l.user = p_user
    ORDER BY a.nom ASC
    LIMIT p_limit OFFSET p_offset;

    -- Sélection finale avec toutes les infos enrichies
    SELECT 
        a.nom AS nom_anime,
        a.nom_url AS nom_url_anime,
        a.affiche_url AS affiche_anime,
        (SELECT GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ')
         FROM tab_categoriser ca
         INNER JOIN tab_categories c ON ca.categorie = c.id
         WHERE ca.anime = a.id) AS categorie_anime,
        (SELECT GROUP_CONCAT(DISTINCT l.nom ORDER BY l.nom SEPARATOR ', ')
         FROM tab_episodes e
         INNER JOIN tab_langues l ON e.langue = l.id
         INNER JOIN tab_saisons s ON e.saison = s.id
         WHERE s.anime = a.id) AS langue_anime,
        (SELECT GROUP_CONCAT(DISTINCT s.subname ORDER BY s.subname SEPARATOR ', ')
         FROM tab_subname s
         WHERE s.anime = a.id) AS subname_anime,
        (SELECT MAX(ms.saisons_anime)
         FROM temp_MaxSaisonsLangue ms
         WHERE ms.anime_id = a.id) AS saisons_anime,
        (SELECT MAX(me.episodes_anime)
         FROM temp_MaxEpisodesLangue me
         WHERE me.anime_id = a.id) AS episodes_anime
    FROM 
        tab_liste_anime a
    WHERE 
        a.id IN (SELECT id FROM temp_user_liked_animes)
    ORDER BY a.nom ASC;

    -- Nettoyage
    DROP TEMPORARY TABLE IF EXISTS temp_MaxSaisonsLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_MaxEpisodesLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_user_liked_animes;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getuserrecommandations` (IN `p_user` VARCHAR(255), IN `p_offset` INT, IN `p_limit` INT)   BEGIN
    -- Animés likés par l'utilisateur
    CREATE TEMPORARY TABLE temp_user_liked_animes AS 
    SELECT a.id
    FROM likes l
    INNER JOIN tab_liste_anime a ON l.anime = a.id
    WHERE l.user = p_user;

    -- Catégories des animés likés
    CREATE TEMPORARY TABLE temp_liked_categories AS
    SELECT DISTINCT ca.categorie
    FROM tab_categoriser ca
    WHERE ca.anime IN (SELECT id FROM temp_user_liked_animes);

    -- Langues des animés likés (via tab_episodes)
    CREATE TEMPORARY TABLE temp_liked_langues AS
    SELECT DISTINCT e.langue
    FROM tab_episodes e
    INNER JOIN tab_saisons s ON e.saison = s.id
    WHERE s.anime IN (SELECT id FROM temp_user_liked_animes);

    -- Score catégorie (poids = 1)
    CREATE TEMPORARY TABLE temp_category_scores AS
    SELECT 
        a.id AS anime_id,
        COUNT(*) AS cat_score
    FROM tab_liste_anime a
    LEFT JOIN tab_categoriser ca ON ca.anime = a.id
    WHERE a.id NOT IN (SELECT id FROM temp_user_liked_animes)
      AND ca.categorie IN (SELECT categorie FROM temp_liked_categories)
    GROUP BY a.id;

    -- Score langue (poids = 2, via tab_episodes)
    CREATE TEMPORARY TABLE temp_langue_scores AS
    SELECT 
        a.id AS anime_id,
        2 * COUNT(*) AS lang_score
    FROM tab_liste_anime a
    LEFT JOIN tab_saisons s ON s.anime = a.id
    LEFT JOIN tab_episodes e ON e.saison = s.id
    WHERE a.id NOT IN (SELECT id FROM temp_user_liked_animes)
      AND e.langue IN (SELECT langue FROM temp_liked_langues)
    GROUP BY a.id;

    -- Score total (cat + langue), uniquement si score > 0
    CREATE TEMPORARY TABLE temp_anime_scores AS
    SELECT 
        a.id AS anime_id,
        COALESCE(c.cat_score, 0) + COALESCE(l.lang_score, 0) AS score
    FROM tab_liste_anime a
    LEFT JOIN temp_category_scores c ON c.anime_id = a.id
    LEFT JOIN temp_langue_scores l ON l.anime_id = a.id
    WHERE a.id NOT IN (SELECT id FROM temp_user_liked_animes)
    HAVING score > 0;

    -- Table temporaire : nombre de saisons par langue (via tab_episodes)
    CREATE TEMPORARY TABLE temp_MaxSaisonsLangue AS 
    SELECT 
        a.id AS anime_id,
        l.nom AS langue_anime,
        COUNT(DISTINCT s.id) AS saisons_anime
    FROM tab_liste_anime a
    INNER JOIN tab_saisons s ON a.id = s.anime
    INNER JOIN tab_episodes e ON e.saison = s.id
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY a.id, l.nom;

    -- Table temporaire : nombre d'épisodes par langue
    CREATE TEMPORARY TABLE temp_MaxEpisodesLangue AS 
    SELECT 
        a.id AS anime_id,
        l.nom AS langue_anime,
        COUNT(e.id) AS episodes_anime
    FROM tab_liste_anime a
    INNER JOIN tab_saisons s ON a.id = s.anime
    INNER JOIN tab_episodes e ON s.id = e.saison
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY a.id, l.nom;

    -- Résultat final avec score et enrichissements
    SELECT 
        a.nom AS nom_anime,
        a.nom_url AS nom_url_anime,
        a.affiche_url AS affiche_anime,
        (SELECT GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ')
         FROM tab_categoriser ca
         INNER JOIN tab_categories c ON ca.categorie = c.id
         WHERE ca.anime = a.id) AS categorie_anime,
        (SELECT GROUP_CONCAT(DISTINCT l.nom ORDER BY l.nom SEPARATOR ', ')
         FROM tab_episodes e
         INNER JOIN tab_langues l ON e.langue = l.id
         INNER JOIN tab_saisons s ON e.saison = s.id
         WHERE s.anime = a.id) AS langue_anime,
        (SELECT GROUP_CONCAT(DISTINCT s.subname ORDER BY s.subname SEPARATOR ', ')
         FROM tab_subname s
         WHERE s.anime = a.id) AS subname_anime,
        (SELECT MAX(ms.saisons_anime)
         FROM temp_MaxSaisonsLangue ms
         WHERE ms.anime_id = a.id) AS saisons_anime,
        (SELECT MAX(me.episodes_anime)
         FROM temp_MaxEpisodesLangue me
         WHERE me.anime_id = a.id) AS episodes_anime,
        s.score
    FROM 
        temp_anime_scores s
    INNER JOIN tab_liste_anime a ON a.id = s.anime_id
    ORDER BY s.score DESC, a.nom ASC
    LIMIT p_offset, p_limit;

    -- Nettoyage
    DROP TEMPORARY TABLE IF EXISTS temp_user_liked_animes;
    DROP TEMPORARY TABLE IF EXISTS temp_liked_categories;
    DROP TEMPORARY TABLE IF EXISTS temp_liked_langues;
    DROP TEMPORARY TABLE IF EXISTS temp_category_scores;
    DROP TEMPORARY TABLE IF EXISTS temp_langue_scores;
    DROP TEMPORARY TABLE IF EXISTS temp_anime_scores;
    DROP TEMPORARY TABLE IF EXISTS temp_MaxSaisonsLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_MaxEpisodesLangue;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getuserwatchlaters` (IN `p_user` VARCHAR(255), IN `p_offset` INT, IN `p_limit` INT)   BEGIN
    -- Nombre de saisons par langue (via tab_episodes)
    CREATE TEMPORARY TABLE temp_MaxSaisonsLangue AS 
    SELECT 
        a.id AS anime_id,
        l.nom AS langue_anime,
        COUNT(DISTINCT s.id) AS saisons_anime
    FROM 
        tab_liste_anime a
    INNER JOIN tab_saisons s ON a.id = s.anime
    INNER JOIN tab_episodes e ON e.saison = s.id
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY a.id, l.nom;

    -- Nombre d'épisodes par langue (via tab_episodes)
    CREATE TEMPORARY TABLE temp_MaxEpisodesLangue AS 
    SELECT 
        a.id AS anime_id,
        l.nom AS langue_anime,
        COUNT(e.id) AS episodes_anime
    FROM 
        tab_liste_anime a
    INNER JOIN tab_saisons s ON a.id = s.anime
    INNER JOIN tab_episodes e ON s.id = e.saison
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY a.id, l.nom;

    -- Liste des animes watchlater de l'utilisateur avec pagination
    CREATE TEMPORARY TABLE temp_user_watchlater_animes AS 
    SELECT a.id
    FROM watchlater l
    INNER JOIN tab_liste_anime a ON l.anime = a.id
    WHERE l.user = p_user
    ORDER BY a.nom ASC
    LIMIT p_limit OFFSET p_offset;

    -- Sélection finale avec toutes les infos enrichies
    SELECT 
        a.nom AS nom_anime,
        a.nom_url AS nom_url_anime,
        a.affiche_url AS affiche_anime,
        (SELECT GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ')
         FROM tab_categoriser ca
         INNER JOIN tab_categories c ON ca.categorie = c.id
         WHERE ca.anime = a.id) AS categorie_anime,
        (SELECT GROUP_CONCAT(DISTINCT l.nom ORDER BY l.nom SEPARATOR ', ')
         FROM tab_episodes e
         INNER JOIN tab_langues l ON e.langue = l.id
         INNER JOIN tab_saisons s ON e.saison = s.id
         WHERE s.anime = a.id) AS langue_anime,
        (SELECT GROUP_CONCAT(DISTINCT s.subname ORDER BY s.subname SEPARATOR ', ')
         FROM tab_subname s
         WHERE s.anime = a.id) AS subname_anime,
        (SELECT MAX(ms.saisons_anime)
         FROM temp_MaxSaisonsLangue ms
         WHERE ms.anime_id = a.id) AS saisons_anime,
        (SELECT MAX(me.episodes_anime)
         FROM temp_MaxEpisodesLangue me
         WHERE me.anime_id = a.id) AS episodes_anime
    FROM 
        tab_liste_anime a
    WHERE 
        a.id IN (SELECT id FROM temp_user_watchlater_animes)
    ORDER BY a.nom ASC;

    -- Nettoyage
    DROP TEMPORARY TABLE IF EXISTS temp_MaxSaisonsLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_MaxEpisodesLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_user_watchlater_animes;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `getwatchlaters` (IN `p_watchlaterAnimesJSON` JSON, IN `p_offset` INT, IN `p_limit` INT)   BEGIN
    -- Tables temporaires pour langues et saisons (via tab_episodes)
    CREATE TEMPORARY TABLE temp_MaxSaisonsLangue AS 
    SELECT 
        a.id AS anime_id,
        l.nom AS langue_anime,
        COUNT(DISTINCT s.id) AS saisons_anime
    FROM 
        tab_liste_anime a
    INNER JOIN tab_saisons s ON a.id = s.anime
    INNER JOIN tab_episodes e ON e.saison = s.id
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY a.id, l.nom;

    CREATE TEMPORARY TABLE temp_anime_ids AS 
    SELECT a.id
    FROM tab_liste_anime a
    INNER JOIN JSON_TABLE(
        p_watchlaterAnimesJSON,
        '$[*]' COLUMNS(nom_url VARCHAR(255) PATH '$')
    ) AS likes_json
    ON a.nom_url = likes_json.nom_url
    LIMIT p_offset, p_limit;

    SELECT 
        a.nom_url,
        a.nom AS nom_anime,
        a.affiche_url AS affiche_anime,
        (SELECT GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ')
         FROM tab_categoriser ca
         INNER JOIN tab_categories c ON ca.categorie = c.id
         WHERE ca.anime = a.id) AS categorie_anime,
        (SELECT GROUP_CONCAT(DISTINCT l.nom ORDER BY l.nom SEPARATOR ', ')
         FROM tab_episodes e
         INNER JOIN tab_langues l ON e.langue = l.id
         INNER JOIN tab_saisons s ON e.saison = s.id
         WHERE s.anime = a.id) AS langue_anime,
        (SELECT GROUP_CONCAT(DISTINCT s.subname ORDER BY s.subname SEPARATOR ', ')
         FROM tab_subname s
         WHERE s.anime = a.id) AS subname_anime,
        (SELECT MAX(ms.saisons_anime)
         FROM temp_MaxSaisonsLangue ms
         WHERE ms.anime_id = a.id) AS saisons_anime
    FROM 
        tab_liste_anime a
    WHERE 
        a.id IN (SELECT id FROM temp_anime_ids)
    ORDER BY a.nom ASC;

    -- Clean-up
    DROP TEMPORARY TABLE IF EXISTS temp_MaxSaisonsLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_anime_ids;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `get_recommandations` (IN `p_likedAnimesJSON` JSON, IN `p_offset` INT, IN `p_limit` INT)   BEGIN
    -- Animés likés
    CREATE TEMPORARY TABLE temp_liked_anime_ids AS 
    SELECT a.id
    FROM tab_liste_anime a
    INNER JOIN JSON_TABLE(
        p_likedAnimesJSON,
        '$[*]' COLUMNS(nom_url VARCHAR(255) PATH '$')
    ) likes_json ON a.nom_url = likes_json.nom_url;

    -- Catégories likées
    CREATE TEMPORARY TABLE temp_liked_categories AS
    SELECT DISTINCT ca.categorie
    FROM tab_categoriser ca
    WHERE ca.anime IN (SELECT id FROM temp_liked_anime_ids);

    -- Langues likées (via tab_episodes)
    CREATE TEMPORARY TABLE temp_liked_langues AS
    SELECT DISTINCT e.langue
    FROM tab_episodes e
    INNER JOIN tab_saisons s ON e.saison = s.id
    WHERE s.anime IN (SELECT id FROM temp_liked_anime_ids);

    -- Score catégorie (poids = 1)
    CREATE TEMPORARY TABLE temp_category_scores AS
    SELECT 
        a.id AS anime_id,
        COUNT(*) AS cat_score
    FROM tab_liste_anime a
    LEFT JOIN tab_categoriser ca ON ca.anime = a.id
    WHERE a.id NOT IN (SELECT id FROM temp_liked_anime_ids)
      AND ca.categorie IN (SELECT categorie FROM temp_liked_categories)
    GROUP BY a.id;

    -- Score langue (poids = 2, via tab_episodes)
    CREATE TEMPORARY TABLE temp_langue_scores AS
    SELECT 
        a.id AS anime_id,
        2 * COUNT(*) AS lang_score
    FROM tab_liste_anime a
    LEFT JOIN tab_saisons s ON s.anime = a.id
    LEFT JOIN tab_episodes e ON e.saison = s.id
    WHERE a.id NOT IN (SELECT id FROM temp_liked_anime_ids)
      AND e.langue IN (SELECT langue FROM temp_liked_langues)
    GROUP BY a.id;

    -- Total score, uniquement si score > 0
    CREATE TEMPORARY TABLE temp_anime_scores AS
    SELECT 
        a.id AS anime_id,
        COALESCE(c.cat_score, 0) + COALESCE(l.lang_score, 0) AS score
    FROM tab_liste_anime a
    LEFT JOIN temp_category_scores c ON c.anime_id = a.id
    LEFT JOIN temp_langue_scores l ON l.anime_id = a.id
    WHERE a.id NOT IN (SELECT id FROM temp_liked_anime_ids)
    HAVING score > 0;

    -- Résultat final
    SELECT 
        a.nom_url,
        a.nom AS nom_anime,
        a.affiche_url AS affiche_anime,
        (SELECT GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ')
         FROM tab_categoriser ca
         INNER JOIN tab_categories c ON ca.categorie = c.id
         WHERE ca.anime = a.id) AS categorie_anime,
        (SELECT GROUP_CONCAT(DISTINCT l.nom ORDER BY l.nom SEPARATOR ', ')
         FROM tab_episodes e
         INNER JOIN tab_langues l ON e.langue = l.id
         INNER JOIN tab_saisons s ON e.saison = s.id
         WHERE s.anime = a.id) AS langue_anime,
        s.score
    FROM 
        temp_anime_scores s
    INNER JOIN tab_liste_anime a ON a.id = s.anime_id
    ORDER BY s.score DESC, a.nom ASC
    LIMIT p_offset, p_limit;

    -- Nettoyage
    DROP TEMPORARY TABLE IF EXISTS temp_liked_anime_ids;
    DROP TEMPORARY TABLE IF EXISTS temp_liked_categories;
    DROP TEMPORARY TABLE IF EXISTS temp_liked_langues;
    DROP TEMPORARY TABLE IF EXISTS temp_category_scores;
    DROP TEMPORARY TABLE IF EXISTS temp_langue_scores;
    DROP TEMPORARY TABLE IF EXISTS temp_anime_scores;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getAnimeEpisodeDefault` (IN `anime_name` VARCHAR(300), IN `anime_langue` VARCHAR(300), IN `anime_saison` VARCHAR(300))   BEGIN

SELECT
tab_episodes.numero AS 'episode_num',
tab_episodes.nom AS 'episode_nom',
tab_episodes.nom_url AS 'episode_nom_url'
FROM tab_liste_anime
INNER JOIN tab_saisons ON tab_liste_anime.id = tab_saisons.anime
INNER JOIN tab_episodes ON tab_saisons.id = tab_episodes.saison
INNER JOIN tab_langues ON tab_episodes.langue = tab_langues.id
WHERE tab_liste_anime.nom_url = anime_name
AND tab_langues.nom = anime_langue
AND tab_saisons.nom_url = anime_saison
ORDER BY tab_episodes.numero ASC
LIMIT 1;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getAnimeEpisodes` (IN `anime_name` VARCHAR(300), IN `anime_langue` VARCHAR(300), IN `anime_saison` VARCHAR(300))   BEGIN

SELECT
tab_episodes.numero AS 'episode_num',
tab_episodes.nom AS 'episode_nom',
tab_episodes.nom_url AS 'episode_nom_url'
FROM tab_liste_anime
INNER JOIN tab_saisons ON tab_liste_anime.id = tab_saisons.anime
INNER JOIN tab_episodes ON tab_saisons.id = tab_episodes.saison
INNER JOIN tab_langues ON tab_episodes.langue = tab_langues.id
WHERE tab_liste_anime.nom_url = anime_name
AND tab_langues.nom = anime_langue
AND tab_saisons.nom_url = anime_saison
ORDER BY tab_episodes.numero ASC;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getAnimeLangueDefault` (IN `anime_name` VARCHAR(300))   BEGIN

SELECT DISTINCT tab_langues.nom AS "anime_langue"
FROM tab_liste_anime
INNER JOIN tab_saisons ON tab_saisons.anime = tab_liste_anime.id
INNER JOIN tab_episodes ON tab_episodes.saison = tab_saisons.id
INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
WHERE tab_liste_anime.nom_url = anime_name
LIMIT 1;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getAnimeLangues` (IN `anime_name` VARCHAR(300))   BEGIN

SELECT DISTINCT tab_langues.nom AS "anime_langue"
FROM tab_liste_anime
INNER JOIN tab_saisons ON tab_saisons.anime = tab_liste_anime.id
INNER JOIN tab_episodes ON tab_episodes.saison = tab_saisons.id
INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
WHERE tab_liste_anime.nom_url = anime_name;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getAnimeLecteurDefault` (IN `anime_name` VARCHAR(300), IN `anime_langue` VARCHAR(300), IN `anime_saison` VARCHAR(300), IN `anime_episode` VARCHAR(300))   BEGIN
    SELECT
        lecteurs.nb_lecteur AS lecteur_nom_url
    FROM tab_liste_anime
    INNER JOIN tab_saisons ON tab_liste_anime.id = tab_saisons.anime
    INNER JOIN tab_episodes ON tab_saisons.id = tab_episodes.saison
    INNER JOIN tab_langues ON tab_episodes.langue = tab_langues.id
    INNER JOIN lecteurs ON tab_episodes.id = lecteurs.id_episode
    WHERE tab_liste_anime.nom_url = anime_name
      AND tab_langues.nom = anime_langue
      AND tab_saisons.nom_url = anime_saison
      AND tab_episodes.nom_url = anime_episode
    LIMIT 1;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getAnimeLecteurs` (IN `anime_name` VARCHAR(300), IN `anime_langue` VARCHAR(300), IN `anime_saison` VARCHAR(300), IN `anime_episode` VARCHAR(300))   BEGIN

SELECT
  lecteurs.nb_lecteur AS 'lecteur_nom'
FROM tab_liste_anime
INNER JOIN tab_saisons ON tab_liste_anime.id = tab_saisons.anime
INNER JOIN tab_episodes ON tab_saisons.id = tab_episodes.saison
INNER JOIN tab_langues ON tab_episodes.langue = tab_langues.id
INNER JOIN lecteurs ON tab_episodes.id = lecteurs.id_episode
WHERE tab_liste_anime.nom_url = anime_name
  AND tab_langues.nom = anime_langue
  AND tab_saisons.nom_url = anime_saison
  AND tab_episodes.nom_url = anime_episode
ORDER BY lecteurs.nb_lecteur ASC;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getAnimeSaisonDefault` (IN `anime_name` VARCHAR(300), IN `saison_langue` VARCHAR(300))   BEGIN

SELECT
    tab_saisons.numero AS 'saison_num',
    tab_saisons.nom AS 'saison_nom',
    tab_saisons.nom_url AS 'saison_nom_url'
FROM tab_liste_anime
INNER JOIN tab_saisons ON tab_liste_anime.id = tab_saisons.anime
WHERE tab_liste_anime.nom_url = anime_name
AND EXISTS (
    SELECT 1
    FROM tab_episodes
    INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
    WHERE tab_episodes.saison = tab_saisons.id
      AND tab_langues.nom = saison_langue
)
ORDER BY tab_saisons.numero ASC
LIMIT 1;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getAnimeSaisons` (IN `anime_name` VARCHAR(300), IN `saison_langue` VARCHAR(300))   BEGIN

SELECT
    tab_saisons.numero AS 'saison_num',
    tab_saisons.nom AS 'saison_nom',
    tab_saisons.nom_url AS 'saison_nom_url'
FROM tab_liste_anime
INNER JOIN tab_saisons ON tab_liste_anime.id = tab_saisons.anime
WHERE tab_liste_anime.nom_url = anime_name
AND EXISTS (
    SELECT 1
    FROM tab_episodes
    INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
    WHERE tab_episodes.saison = tab_saisons.id
      AND tab_langues.nom = saison_langue
)
ORDER BY tab_saisons.numero ASC;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getInfoLecteur` (IN `_anime` VARCHAR(300), IN `_langue` VARCHAR(300), IN `_saison` VARCHAR(300), IN `_episode` VARCHAR(300), IN `_lecteur` INT)   BEGIN

SELECT lecteurs.url_episode AS 'url_video',
tab_liste_anime.nom AS 'nom_anime', 
tab_liste_anime.description AS 'description_anime', 
tab_langues.nom AS 'nom_langue', 
tab_saisons.nom AS 'nom_saison', 
tab_episodes.nom AS 'nom_episode'
FROM tab_episodes
INNER JOIN tab_saisons ON tab_saisons.id = tab_episodes.saison
INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
INNER JOIN tab_liste_anime ON tab_liste_anime.id = tab_saisons.anime
INNER JOIN lecteurs ON tab_episodes.id = lecteurs.id_episode
WHERE tab_liste_anime.nom_url = _anime
AND tab_langues.nom = _langue
AND tab_saisons.nom_url = _saison
AND tab_episodes.nom_url = _episode
AND lecteurs.nb_lecteur = _lecteur;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `proc_getLanguesEpisode` (IN `anime_name` VARCHAR(300), IN `saison_name` VARCHAR(300), IN `episode_name` VARCHAR(300))   BEGIN

SELECT tab_langues.nom AS 'anime_langue'
FROM tab_episodes
INNER JOIN tab_langues ON tab_langues.id = tab_episodes.langue
INNER JOIN tab_saisons ON tab_episodes.saison = tab_saisons.id
INNER JOIN tab_liste_anime ON tab_saisons.anime = tab_liste_anime.id
WHERE tab_episodes.nom_url = episode_name
AND tab_liste_anime.nom_url = anime_name
AND tab_saisons.nom_url = saison_name;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `recentupdate` (IN `p_limit` INT, IN `p_offset` INT)   BEGIN

    SELECT 
        tab_episodes.id AS "id_episode", 
        tab_episodes.nom AS "nom_episode", 
        tab_episodes.nom_url AS "nom_episode_url",
        tab_saisons.nom AS "nom_saison",
        tab_saisons.nom_url AS "nom_saison_url",
        tab_langues.nom AS "nom_langue", 
        tab_liste_anime.nom AS "nom_anime", 
        tab_liste_anime.nom_url AS "nom_anime_url", 
        tab_liste_anime.affiche_url AS 'affiche', 
        GROUP_CONCAT(tab_subname.subname SEPARATOR ',') AS "anime_subname"
    FROM tab_liste_anime
    INNER JOIN tab_saisons ON tab_saisons.anime = tab_liste_anime.id
    INNER JOIN tab_episodes ON tab_episodes.saison = tab_saisons.id
    INNER JOIN tab_langues ON tab_episodes.langue = tab_langues.id
    LEFT JOIN tab_subname ON tab_liste_anime.id = tab_subname.anime
    WHERE tab_episodes.date_ajout >= DATE_SUB(NOW(), INTERVAL 3 DAY)
    GROUP BY 
        tab_episodes.id, 
        tab_episodes.nom, 
        tab_episodes.nom_url, 
        tab_langues.nom, 
        tab_liste_anime.nom, 
        tab_liste_anime.nom_url, 
        tab_liste_anime.affiche_url
    ORDER BY tab_episodes.date_ajout DESC
    LIMIT p_offset, p_limit;

END$$

CREATE DEFINER=`watch_anime_user`@`localhost` PROCEDURE `searchanimes` (IN `p_limit` INT, IN `p_offset` INT, IN `p_search` VARCHAR(255), IN `p_filters` VARCHAR(255))   BEGIN
    -- Table temporaire pour stocker les saisons max par langue (via tab_episodes)
    CREATE TEMPORARY TABLE temp_MaxSaisonsLangue AS 
    SELECT 
        la.id           AS anime_id,
        l.nom           AS langue_anime,
        COUNT(DISTINCT s.id) AS saisons_anime
    FROM tab_liste_anime la
    INNER JOIN tab_saisons s ON la.id = s.anime
    INNER JOIN tab_episodes e ON e.saison = s.id
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY la.id, l.nom;
    
    -- Table temporaire pour stocker les épisodes max par langue (via tab_episodes)
    CREATE TEMPORARY TABLE temp_MaxEpisodesLangue AS 
    SELECT 
        la.id           AS anime_id,
        l.nom           AS langue_anime,
        COUNT(e.id) AS episodes_anime
    FROM tab_liste_anime la
    INNER JOIN tab_saisons s ON la.id = s.anime
    INNER JOIN tab_episodes e ON e.saison = s.id
    INNER JOIN tab_langues l ON l.id = e.langue
    GROUP BY la.id, l.nom;
    
    -- Table temporaire des IDs d'anime filtrés par nom, nom_url OU par subname
    CREATE TEMPORARY TABLE temp_anime_ids AS 
    SELECT DISTINCT la.id
    FROM tab_liste_anime la
    LEFT JOIN tab_subname sn 
        ON sn.anime = la.id
    WHERE 
        (la.nom LIKE CONCAT('%', p_search, '%') 
         OR la.nom_url LIKE CONCAT('%', p_search, '%')
         OR sn.subname LIKE CONCAT('%', p_search, '%'))
        AND (
            p_filters IS NULL OR p_filters = '' 
            OR EXISTS (
                SELECT 1
                FROM tab_episodes e
                JOIN tab_langues l ON e.langue = l.id
                JOIN tab_saisons s ON e.saison = s.id
                WHERE s.anime = la.id
                  AND FIND_IN_SET(l.nom, p_filters) > 0
            )
            OR EXISTS (
                SELECT 1
                FROM tab_categoriser ca
                JOIN tab_categories c ON ca.categorie = c.id
                WHERE ca.anime = la.id
                  AND FIND_IN_SET(c.nom, p_filters) > 0
            )
        )
    ORDER BY la.nom ASC
    LIMIT p_limit OFFSET p_offset;
    
    -- Sélection finale avec toutes les infos
    SELECT 
        la.nom         AS nom_anime,
        la.nom_url     AS nom_url_anime,
        la.affiche_url AS affiche_anime,
        
        -- catégories
        (SELECT GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ')
         FROM tab_categoriser ca
         JOIN tab_categories c ON ca.categorie = c.id
         WHERE ca.anime = la.id
        ) AS categorie_anime,
        
        -- langues parlées (via tab_episodes)
        (SELECT GROUP_CONCAT(DISTINCT l.nom ORDER BY l.nom SEPARATOR ', ')
         FROM tab_episodes e
         JOIN tab_langues l ON e.langue = l.id
         JOIN tab_saisons s ON e.saison = s.id
         WHERE s.anime = la.id
        ) AS langue_anime,
        
        -- subnames (table tab_subname)
        (SELECT GROUP_CONCAT(DISTINCT s.subname ORDER BY s.subname SEPARATOR ', ')
         FROM tab_subname s
         WHERE s.anime = la.id
        ) AS subname_anime,
        
        -- nombre max de saisons
        (SELECT MAX(ms.saisons_anime)
         FROM temp_MaxSaisonsLangue ms
         WHERE ms.anime_id = la.id
        ) AS saisons_anime,
        
        -- nombre max d'épisodes
        (SELECT MAX(me.episodes_anime)
         FROM temp_MaxEpisodesLangue me
         WHERE me.anime_id = la.id
        ) AS episodes_anime
    FROM tab_liste_anime la
    WHERE la.id IN (SELECT id FROM temp_anime_ids)
    ORDER BY la.nom ASC;
    
    -- Nettoyage
    DROP TEMPORARY TABLE IF EXISTS temp_MaxSaisonsLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_MaxEpisodesLangue;
    DROP TEMPORARY TABLE IF EXISTS temp_anime_ids;
END$$

CREATE DEFINER=`watch_anime_user`@`%` PROCEDURE `updateChangeLog` (IN `_id` INT, IN `_ajouts` TEXT, IN `_auteur` VARCHAR(255))   BEGIN

UPDATE `changelogs` SET `codeChangeLog`=_ajouts,`auteur`=_auteur WHERE id = _id;

END$$

--
-- Fonctions
--
CREATE DEFINER=`watch_anime_user`@`localhost` FUNCTION `addtohistory` (`user_params` VARCHAR(255), `anime_params` VARCHAR(300), `langue_params` VARCHAR(300), `saison_params` VARCHAR(300), `episode_params` VARCHAR(300)) RETURNS INT(11)  BEGIN
    DECLARE RETOUR INT DEFAULT 1;
    DECLARE episode_id INT DEFAULT 0;

    SELECT e.id INTO episode_id
    FROM tab_episodes e
    INNER JOIN tab_saisons s ON s.id = e.saison
    INNER JOIN tab_liste_anime a ON s.anime = a.id
    INNER JOIN tab_langues l ON e.langue = l.id
    WHERE e.nom_url = episode_params
      AND s.nom_url = saison_params
      AND l.nom = langue_params
      AND a.nom_url = anime_params
    LIMIT 1;

    IF episode_id = 0 THEN
        SET RETOUR = 0;
    ELSE
        IF NOT EXISTS (
            SELECT 1 FROM history h WHERE h.user = user_params AND h.episode = episode_id
        ) THEN
            INSERT INTO history (user, episode, date) 
            VALUES (user_params, episode_id, CURRENT_TIMESTAMP);
        ELSE
            UPDATE history 
            SET date = CURRENT_TIMESTAMP
            WHERE user = user_params AND episode = episode_id;
        END IF;
    END IF;

    RETURN RETOUR;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` FUNCTION `changelikestate` (`_user` VARCHAR(255), `_anime_url` VARCHAR(300)) RETURNS INT(11) DETERMINISTIC BEGIN
    DECLARE result INT DEFAULT 0;
    DECLARE anime_id INT;

    -- Handler to catch any SQL errors and return -1
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        RETURN -1;
    END;

    -- Récupérer l'ID correspondant au nom_url
    SELECT id INTO anime_id
    FROM tab_liste_anime
    WHERE nom_url = _anime_url
    LIMIT 1;

    -- Vérifier si déjà liké
    IF EXISTS (
        SELECT 1
        FROM likes
        WHERE `user` = _user
          AND anime = anime_id
    ) THEN
        DELETE FROM likes
        WHERE `user` = _user
          AND anime = anime_id;
        SET result = 0;
    ELSE
        INSERT INTO likes (`user`, anime)
        VALUES (_user, anime_id);
        SET result = 1;
    END IF;

    RETURN result;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` FUNCTION `changewatchlaterstate` (`_user` VARCHAR(255), `_anime_url` VARCHAR(300)) RETURNS INT(11) DETERMINISTIC BEGIN
    DECLARE result INT DEFAULT 0;
    DECLARE anime_id INT;

    -- Handler to catch any SQL errors and return -1
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        RETURN -1;
    END;

    -- Récupérer l'ID correspondant au nom_url
    SELECT id INTO anime_id
    FROM tab_liste_anime
    WHERE nom_url = _anime_url
    LIMIT 1;

    -- Vérifier si déjà liké
    IF EXISTS (
        SELECT 1
        FROM watchlater
        WHERE `user` = _user
          AND anime = anime_id
    ) THEN
        DELETE FROM watchlater
        WHERE `user` = _user
          AND anime = anime_id;
        SET result = 0;
    ELSE
        INSERT INTO watchlater (`user`, anime)
        VALUES (_user, anime_id);
        SET result = 1;
    END IF;

    RETURN result;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` FUNCTION `haslike` (`_user` VARCHAR(255), `_anime` VARCHAR(300)) RETURNS INT(11) DETERMINISTIC BEGIN
    DECLARE result INT DEFAULT 0;

    IF EXISTS (
        SELECT 1
        FROM likes
        INNER JOIN tab_liste_anime ON tab_liste_anime.id = likes.anime
        WHERE `user` = _user
          AND tab_liste_anime.nom_url = _anime
    ) THEN
        SET result = 1;
    END IF;

    RETURN result;
END$$

CREATE DEFINER=`watch_anime_user`@`localhost` FUNCTION `haswatchlater` (`_user` VARCHAR(255), `_anime` VARCHAR(300)) RETURNS INT(11) DETERMINISTIC BEGIN
    DECLARE result INT DEFAULT 0;

    IF EXISTS (
        SELECT 1
        FROM watchlater
        INNER JOIN tab_liste_anime ON tab_liste_anime.id = watchlater.anime
        WHERE `user` = _user
          AND tab_liste_anime.nom_url = _anime
    ) THEN
        SET result = 1;
    END IF;

    RETURN result;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `changelogs`
--

CREATE TABLE `changelogs` (
  `id` int(11) NOT NULL,
  `codeChangeLog` text NOT NULL,
  `auteur` varchar(255) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Structure de la table `history`
--

CREATE TABLE `history` (
  `user` varchar(255) NOT NULL,
  `episode` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Structure de la table `lecteurs`
--

CREATE TABLE `lecteurs` (
  `id_episode` int(11) NOT NULL,
  `nb_lecteur` int(11) NOT NULL,
  `url_episode` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Structure de la table `likes`
--

CREATE TABLE `likes` (
  `user` varchar(255) NOT NULL,
  `anime` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tab_categories`
--

CREATE TABLE `tab_categories` (
  `id` int(11) NOT NULL,
  `nom` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tab_categoriser`
--

CREATE TABLE `tab_categoriser` (
  `anime` int(11) NOT NULL,
  `categorie` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tab_episodes`
--

CREATE TABLE `tab_episodes` (
  `id` int(11) NOT NULL,
  `saison` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `langue` int(11) NOT NULL,
  `nom` varchar(300) NOT NULL,
  `nom_url` varchar(300) NOT NULL,
  `date_ajout` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tab_langues`
--

CREATE TABLE `tab_langues` (
  `id` int(11) NOT NULL,
  `nom` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tab_liste_anime`
--

CREATE TABLE `tab_liste_anime` (
  `id` int(11) NOT NULL,
  `nom` varchar(300) NOT NULL,
  `nom_url` varchar(300) NOT NULL,
  `affiche_url` varchar(500) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tab_saisons`
--

CREATE TABLE `tab_saisons` (
  `id` int(11) NOT NULL,
  `anime` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `nom` varchar(300) NOT NULL,
  `nom_url` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tab_subname`
--

CREATE TABLE `tab_subname` (
  `anime` int(11) NOT NULL,
  `subname` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT 0,
  `provider` varchar(50) DEFAULT NULL,
  `providerId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Structure de la table `watchlater`
--

CREATE TABLE `watchlater` (
  `user` varchar(255) NOT NULL,
  `anime` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `changelogs`
--
ALTER TABLE `changelogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `auteur` (`auteur`);

--
-- Index pour la table `history`
--
ALTER TABLE `history`
  ADD KEY `user` (`user`),
  ADD KEY `episode` (`episode`);

--
-- Index pour la table `lecteurs`
--
ALTER TABLE `lecteurs`
  ADD KEY `id_episode` (`id_episode`);

--
-- Index pour la table `likes`
--
ALTER TABLE `likes`
  ADD KEY `anime` (`anime`),
  ADD KEY `user` (`user`);

--
-- Index pour la table `tab_categories`
--
ALTER TABLE `tab_categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `tab_categoriser`
--
ALTER TABLE `tab_categoriser`
  ADD KEY `anime` (`anime`),
  ADD KEY `categorie` (`categorie`);

--
-- Index pour la table `tab_episodes`
--
ALTER TABLE `tab_episodes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `saison` (`saison`),
  ADD KEY `langue` (`langue`);

--
-- Index pour la table `tab_langues`
--
ALTER TABLE `tab_langues`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `tab_liste_anime`
--
ALTER TABLE `tab_liste_anime`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `tab_saisons`
--
ALTER TABLE `tab_saisons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `anime` (`anime`);

--
-- Index pour la table `tab_subname`
--
ALTER TABLE `tab_subname`
  ADD KEY `anime` (`anime`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `providerId` (`providerId`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Index pour la table `watchlater`
--
ALTER TABLE `watchlater`
  ADD KEY `anime` (`anime`),
  ADD KEY `user` (`user`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `changelogs`
--
ALTER TABLE `changelogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tab_categories`
--
ALTER TABLE `tab_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tab_episodes`
--
ALTER TABLE `tab_episodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tab_langues`
--
ALTER TABLE `tab_langues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tab_liste_anime`
--
ALTER TABLE `tab_liste_anime`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tab_saisons`
--
ALTER TABLE `tab_saisons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `changelogs`
--
ALTER TABLE `changelogs`
  ADD CONSTRAINT `changelogs_ibfk_1` FOREIGN KEY (`auteur`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `history_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `history_ibfk_2` FOREIGN KEY (`episode`) REFERENCES `tab_episodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `lecteurs`
--
ALTER TABLE `lecteurs`
  ADD CONSTRAINT `lecteurs_ibfk_1` FOREIGN KEY (`id_episode`) REFERENCES `tab_episodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`anime`) REFERENCES `tab_liste_anime` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `tab_categoriser`
--
ALTER TABLE `tab_categoriser`
  ADD CONSTRAINT `tab_categoriser_ibfk_1` FOREIGN KEY (`anime`) REFERENCES `tab_liste_anime` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tab_categoriser_ibfk_2` FOREIGN KEY (`categorie`) REFERENCES `tab_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `tab_episodes`
--
ALTER TABLE `tab_episodes`
  ADD CONSTRAINT `tab_episodes_ibfk_1` FOREIGN KEY (`saison`) REFERENCES `tab_saisons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tab_episodes_ibfk_2` FOREIGN KEY (`langue`) REFERENCES `tab_langues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `tab_saisons`
--
ALTER TABLE `tab_saisons`
  ADD CONSTRAINT `tab_saisons_ibfk_1` FOREIGN KEY (`anime`) REFERENCES `tab_liste_anime` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `tab_subname`
--
ALTER TABLE `tab_subname`
  ADD CONSTRAINT `tab_subname_ibfk_1` FOREIGN KEY (`anime`) REFERENCES `tab_liste_anime` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `watchlater`
--
ALTER TABLE `watchlater`
  ADD CONSTRAINT `watchlater_ibfk_1` FOREIGN KEY (`anime`) REFERENCES `tab_liste_anime` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `watchlater_ibfk_2` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
