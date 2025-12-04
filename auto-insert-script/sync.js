const { logError } = require('./logger');

async function syncAnime(infos, poster, db, caches) {
    const { langueCache, categorieCache, foundAnimeNomUrl, foundSaisonKey, foundEpisodeKey, foundLecteurKey } = caches;

    // 1. Main Anime
    let animeId;
    // Sanitize nom_url_anime: remove problematic characters
    const nom_url_anime = infos.titre
        .replace(/['",:;\.\?!\(\)\[\]\{\}]/g, '') // remove special chars
        .replace(/\s+/g, '-')
        .toLowerCase();
    foundAnimeNomUrl.add(nom_url_anime);
    // Default poster if none found
    const defaultPoster = 'https://i.seadn.io/gae/2hDpuTi-0AMKvoZJGd-yKWvK4tKdQr_kLIpB_qSeMau2TNGCNidAosMEvrEXFO9G6tmlFlPQplpwiqirgrIPWnCKMvElaYgI-HiVvXc?auto=format&dpr=1&w=1000';
    let posterToUse = poster || defaultPoster;
    if (!posterToUse) posterToUse = defaultPoster;
    // Check if anime exists
    const [animeRows] = await db.query('SELECT id, affiche_url, nom_url, description FROM tab_liste_anime WHERE nom_url = ?', [nom_url_anime]);
    if (animeRows.length > 0) {
        animeId = animeRows[0].id;
        // Update affiche_url if different and not default
        if (poster && poster !== defaultPoster && poster !== animeRows[0].affiche_url) {
            console.log(`[SYNC] Poster update for ${infos.titre} : ${poster}`);
            await db.query('UPDATE tab_liste_anime SET affiche_url = ? WHERE id = ?', [poster, animeId]);
            // Download, convert, upload cover
            const destFileName = `${nom_url_anime}.webp`;
        }
        // If affiche_url is missing or default, update to posterToUse
        if (!animeRows[0].affiche_url || animeRows[0].affiche_url === defaultPoster) {
            if (posterToUse !== defaultPoster) {
                console.log(`[SYNC] Adding missing poster for ${infos.titre} : ${posterToUse}`);
            }
            await db.query('UPDATE tab_liste_anime SET affiche_url = ? WHERE id = ?', [posterToUse, animeId]);
            // Download, convert, upload cover
            const destFileName = `${nom_url_anime}.webp`;
        }
        // Update description if different
        const dbDescription = animeRows[0].description || '';
        const scrapedDescription = infos.synopsis || '';
        if (scrapedDescription && scrapedDescription !== dbDescription) {
            await db.query('UPDATE tab_liste_anime SET description = ? WHERE id = ?', [scrapedDescription, animeId]);
        }
    } else {
        await db.query(
            'INSERT INTO tab_liste_anime (nom, nom_url, affiche_url, description) VALUES (?, ?, ?, ?)',
            [infos.titre, nom_url_anime, posterToUse, infos.synopsis || '']
        );
        const [rows] = await db.query('SELECT id FROM tab_liste_anime WHERE nom_url = ?', [nom_url_anime]);
        animeId = rows[0]?.id;
        // Download, convert, upload cover
        const destFileName = `${nom_url_anime}.webp`;
        // Notify if default poster
        if (posterToUse === defaultPoster) {
            // await sendDiscordDM(`New anime inserted with default poster : ${infos.titre} (nom_url: ${nom_url_anime})`);
        }
    }

    // 2. Alternative Titles
    for (const subname of infos.titresAlter) {
        const [subRows] = await db.query('SELECT * FROM tab_subname WHERE anime = ? AND subname = ?', [animeId, subname]);
        if (subRows.length === 0) {
            await db.query('INSERT INTO tab_subname (anime, subname) VALUES (?, ?)', [animeId, subname]);
        }
    }

    // 3. Genres/Categories
    for (const cat of infos.genres) {
        let catId = categorieCache.get(cat);
        if (!catId) {
            const [catRows2] = await db.query('SELECT id FROM tab_categories WHERE nom = ?', [cat]);
            if (catRows2.length > 0) {
                catId = catRows2[0].id;
            } else {
                await db.query('INSERT INTO tab_categories (nom) VALUES (?)', [cat]);
                const [rows] = await db.query('SELECT id FROM tab_categories WHERE nom = ?', [cat]);
                catId = rows[0]?.id;
            }
            categorieCache.set(cat, catId);
        }
        const [catLinkRows] = await db.query('SELECT * FROM tab_categoriser WHERE anime = ? AND categorie = ?', [animeId, catId]);
        if (catLinkRows.length === 0) {
            await db.query('INSERT INTO tab_categoriser (anime, categorie) VALUES (?, ?)', [animeId, catId]);
        }
    }

    // 4. Seasons
    // Update all seasons order for this anime based on scraped order
    // Build a map: nom_url_saison -> scraped order
    const saisonOrderMap = new Map();
    infos.animeLinks.forEach((saison, idx) => {
        // Sanitize nom_url_saison: remove problematic characters
        const nom_url_saison = saison.nom
            .replace(/['",:;\.\?!\(\)\[\]\{\}]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase();
        saisonOrderMap.set(nom_url_saison, saison.ordre || (idx + 1));
    });
    // Get all seasons for this anime from DB
    const [dbSaisons] = await db.query('SELECT id, nom_url, numero FROM tab_saisons WHERE anime = ?', [animeId]);
    for (const dbSaison of dbSaisons) {
        const newOrder = saisonOrderMap.get(dbSaison.nom_url);
        if (newOrder && dbSaison.numero !== newOrder) {
            await db.query('UPDATE tab_saisons SET numero = ? WHERE id = ?', [newOrder, dbSaison.id]);
        }
    }
    // Now process each season
    for (const saison of infos.animeLinks) {
        let saisonId;
        const nom_url_saison = saison.nom.replace(/\s+/g, '-').toLowerCase();
        foundSaisonKey.add(`${animeId}|||${nom_url_saison}`);
        const [saisonRows] = await db.query('SELECT id FROM tab_saisons WHERE anime = ? AND nom_url = ?', [animeId, nom_url_saison]);
        if (saisonRows.length > 0) {
            saisonId = saisonRows[0].id;
        } else {
            await db.query(
                'INSERT INTO tab_saisons (anime, numero, nom, nom_url) VALUES (?, ?, ?, ?)',
                [animeId, saison.ordre || 1, saison.nom, nom_url_saison]
            );
            const [rows] = await db.query('SELECT id FROM tab_saisons WHERE anime = ? AND nom_url = ?', [animeId, nom_url_saison]);
            saisonId = rows[0]?.id;
        }

        // Update all episodes order for this saison/langue based on scraped order
        // Build a map: nom_url_episode -> scraped order
        for (const [epIdx, episode] of saison.episodes.entries()) {
            // Langue
            let langueId;
            let langRaw = episode.lecteurs[0]?.lang || saison.lang || 'vostfr';
            // Correction: if season is vf1/vf2 and player is vf, force language to season
            if ((saison.lang === 'vf1' || saison.lang === 'vf2') && langRaw === 'vf') {
                langRaw = saison.lang;
            }
            const lang = langRaw.toUpperCase();
            if (langueCache.has(lang)) {
                langueId = langueCache.get(lang);
            } else {
                const [langRows2] = await db.query('SELECT id FROM tab_langues WHERE nom = ?', [lang]);
                if (langRows2.length > 0) {
                    langueId = langRows2[0].id;
                } else {
                    await db.query('INSERT INTO tab_langues (nom) VALUES (?)', [lang]);
                    const [rows] = await db.query('SELECT id FROM tab_langues WHERE nom = ?', [lang]);
                    langueId = rows[0]?.id;
                }
                langueCache.set(lang, langueId);
            }

            // Build episode order map for this saison/langue
            const nom_url_episode = episode.nom.replace(/\s+/g, '-').toLowerCase();
            foundEpisodeKey.add(`${saisonId}|||${langueId}|||${nom_url_episode}`);
            // Get all episodes for this saison/langue from DB
            const [dbEpisodes] = await db.query('SELECT id, nom_url, numero FROM tab_episodes WHERE saison = ? AND langue = ?', [saisonId, langueId]);
            // Only update once per saison/langue
            if (epIdx === 0) {
                // Build scraped order map
                const scrapedOrderMap = new Map();
                saison.episodes.forEach((ep, idx2) => {
                    const epUrl = ep.nom.replace(/\s+/g, '-').toLowerCase();
                    scrapedOrderMap.set(epUrl, idx2 + 1);
                });
                for (const dbEp of dbEpisodes) {
                    const newOrder = scrapedOrderMap.get(dbEp.nom_url);
                    if (newOrder && dbEp.numero !== newOrder) {
                        await db.query('UPDATE tab_episodes SET numero = ? WHERE id = ?', [newOrder, dbEp.id]);
                    }
                }
            }

            // Episode
            const [epRows] = await db.query('SELECT id FROM tab_episodes WHERE saison = ? AND langue = ? AND nom_url = ?', [saisonId, langueId, nom_url_episode]);
            let episodeId;
            if (epRows.length > 0) {
                episodeId = epRows[0].id;
            } else {
                await db.query(
                    'INSERT INTO tab_episodes (saison, numero, langue, nom, nom_url) VALUES (?, ?, ?, ?, ?)',
                    [saisonId, epIdx + 1, langueId, episode.nom, nom_url_episode]
                );
                const [rows] = await db.query('SELECT id FROM tab_episodes WHERE saison = ? AND langue = ? AND nom_url = ?', [saisonId, langueId, nom_url_episode]);
                episodeId = rows[0]?.id;
            }

            // 6. Lecteurs
            for (const [lectIdx, lecteur] of episode.lecteurs.entries()) {
                foundLecteurKey.add(`${episodeId}|||${lectIdx + 1}`);

                // Transform vidmoly.to links to vidmoly.net
                let processedUrl = lecteur.url;
                if (processedUrl.startsWith('https://vidmoly.to/')) {
                    processedUrl = processedUrl.replace('https://vidmoly.to/', 'https://vidmoly.net/');
                }

                const [lectRows] = await db.query('SELECT * FROM lecteurs WHERE id_episode = ? AND nb_lecteur = ?', [episodeId, lectIdx + 1]);
                if (lectRows.length === 0) {
                    await db.query(
                        'INSERT INTO lecteurs (id_episode, nb_lecteur, url_episode) VALUES (?, ?, ?)',
                        [episodeId, lectIdx + 1, processedUrl]
                    );
                } else {
                    // Update url_episode if different
                    if (lectRows[0].url_episode !== processedUrl) {
                        await db.query('UPDATE lecteurs SET url_episode = ? WHERE id_episode = ? AND nb_lecteur = ?', [processedUrl, episodeId, lectIdx + 1]);
                    }
                }
            }
        }
    }
}

module.exports = {
    syncAnime
};
