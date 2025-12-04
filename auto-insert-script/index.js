const fs = require('fs');
const config = require('./config');
const { logError } = require('./logger');
const { validateDbEnv, connectWithRetries } = require('./database');
const { fetchLinksFromPage, fetchInfos, getPoster, checkLangsForSeason } = require('./scraper');
const { syncAnime } = require('./sync');

async function main() {
  try {
    // Connect to MariaDB database
    validateDbEnv();
    const db = await connectWithRetries(5, 3000);

    let page = 1;
    let allLinks = [];
    while (true) {
      const links = await fetchLinksFromPage(page);
      if (!links.length) break;
      allLinks.push(...links);
      console.log(`Page ${page} : ${links.length} links found.`);
      page++;
    }
    allLinks = [...new Set(allLinks)];
    const max = 9999999999;
    const results = [];

    // Prepare cache to avoid duplicates
    const caches = {
      animeCache: new Map(),
      saisonCache: new Map(),
      langueCache: new Map(),
      episodeCache: new Map(),
      categorieCache: new Map(),
      foundAnimeNomUrl: new Set(),
      foundSaisonKey: new Set(), // animeId + nom_url_saison
      foundEpisodeKey: new Set(), // saisonId + langueId + nom_url_episode
      foundLecteurKey: new Set(), // episodeId + nb_lecteur
    };

    // Fetch existing languages
    const [langRows] = await db.query('SELECT id, nom FROM tab_langues');
    for (const row of langRows) caches.langueCache.set(row.nom, row.id);

    // Fetch existing categories
    const [catRows] = await db.query('SELECT id, nom FROM tab_categories');
    for (const row of catRows) caches.categorieCache.set(row.nom, row.id);

    for (const [i, link] of allLinks.slice(0, max).entries()) {
      const cleanLink = link.trim().replace(/\/+/, '/').replace(/([^:])\/\//g, '$1/').replace(':/', '://');
      console.log(`Fetching info ${i + 1}/${Math.min(allLinks.length, max)} : ${cleanLink}`);
      const infos = await fetchInfos(cleanLink);
      const poster = await getPoster(infos.titre, infos.titresAlter);
      await Promise.all(infos.animeLinks.map(async saison => {
        saison.langs = await checkLangsForSeason(saison.href.trim(), cleanLink);
      }));
      results.push({ url: cleanLink, ...infos, poster });

      await syncAnime(infos, poster, db, caches);
    }

    fs.writeFileSync('catalog_links.json', JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Done. ${results.length} entries saved to catalog_links.json and inserted into database.`);
    await db.end();
  } catch (err) {
    logError(`[MAIN] Unexpected error : ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
    console.error('[MAIN] Unexpected error :', err);
    throw err;
  }
}

// Function to wrap main() with logs
async function runMainWithLog() {
  try {
    console.log(`[CRON] Scraping started at ${new Date().toLocaleString()}`);
    await main();
    console.log(`[CRON] Scraping finished at ${new Date().toLocaleString()}`);
  } catch (e) {
    logError(`[CRON] Error during scraping : ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
    console.error('[CRON] Error during scraping :', e);
  }
}

// Run once at startup
runMainWithLog();
// Then every 3 hours (10 800 000 ms)
setInterval(runMainWithLog, 3 * 60 * 60 * 1000);