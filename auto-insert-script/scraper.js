// const axios = require('axios'); // Replaced by got-scraping
const cheerio = require('cheerio');
const config = require('./config');
const { logError } = require('./logger');

function detectLangFromHref(href) {
    for (const lang of config.LANGS) {
        if (href.endsWith('/' + lang) || href === lang) return lang;
    }
    return null;
}

async function checkLangsForSeason(baseHref, baseAnimeUrl) {
    const results = {};
    const detectedLang = detectLangFromHref(baseHref.trim());
    let base = baseHref.trim();
    if (detectedLang) {
        base = base.replace(new RegExp(`(\/)?${detectedLang}$`), '');
        if (base.endsWith('/')) base = base.slice(0, -1);
    }
    for (const lang of config.LANGS) {
        if (lang === detectedLang) {
            results[lang] = true;
            continue;
        }
        let url = `${baseAnimeUrl.trim().replace(/\/$/, '')}/${base}/${lang}`;
        url = url.replace(/\/+/, '/').replace(/([^:])\/\//g, '$1/').replace(':/', '://');
        try {
            const { gotScraping } = await import('got-scraping');
            const options = { url, throwHttpErrors: false };

            const res = await gotScraping(options);
            results[lang] = res.statusCode !== 404;
        } catch {
            results[lang] = false;
        }
    }
    return results;
}

async function getPoster(titre, titresAlter = []) {
    const { gotScraping } = await import('got-scraping');
    const titles = [titre, ...titresAlter].filter(Boolean);

    const isMatch = (searchTitle, foundTitles) => {
        const s = searchTitle.toLowerCase().trim();
        return foundTitles.some(ft => {
            if (!ft) return false;
            const f = ft.toLowerCase().trim();
            if (f === s) return true;
            if (s.length > 3 && f.includes(s)) return true;
            if (f.length > 3 && s.includes(f)) return true;
            return false;
        });
    };

    for (const t of titles) {
        // Kitsu
        try {
            const options = { url: `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(t)}` };
            const res = await gotScraping(options);
            const d = JSON.parse(res.body);
            if (d?.data?.length) {
                const attrs = d.data[0].attributes;
                const foundTitles = [attrs.canonicalTitle, ...Object.values(attrs.titles || {})];
                if (isMatch(t, foundTitles)) {
                    return attrs.posterImage?.original || null;
                }
            }
        } catch { }
        // Jikan
        try {
            const options = { url: `https://api.jikan.moe/v4/anime`, searchParams: { q: t, limit: 1 } };
            const res = await gotScraping(options);
            const d = JSON.parse(res.body);
            if (d?.data?.length) {
                const item = d.data[0];
                const foundTitles = item.titles ? item.titles.map(x => x.title) : [item.title];
                if (isMatch(t, foundTitles)) {
                    return item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null;
                }
            }
        } catch { }
        // Anilist
        try {
            const query = `query ($search: String) { Media(search: $search, type: ANIME) { title { romaji english native } coverImage { extraLarge large medium } } }`;
            const options = {
                url: 'https://graphql.anilist.co',
                json: { query, variables: { search: t } },
                headers: { 'Content-Type': 'application/json' }
            };
            const res = await gotScraping.post(options);
            const d = JSON.parse(res.body);
            const media = d?.data?.Media;
            if (media) {
                const foundTitles = [media.title.romaji, media.title.english, media.title.native];
                if (isMatch(t, foundTitles)) {
                    const img = media.coverImage;
                    return img?.extraLarge || img?.large || img?.medium || null;
                }
            }
        } catch { }
    }
    return null;
}

async function fetchLinksFromPage(page) {
    try {
        const { gotScraping } = await import('got-scraping');
        const options = {
            url: `${config.BASE_URL}${page}`,
            throwHttpErrors: false,
            headerGeneratorOptions: {
                browsers: [{ name: 'chrome', minVersion: 110 }],
                devices: ['desktop'],
                operatingSystems: ['windows', 'linux'],
            }
        };

        const response = await gotScraping(options);

        if (response.statusCode !== 200) {
            console.error(`[PAGE] HTTP Error ${response.statusCode} for ${config.BASE_URL}${page}`);
            logError(`[PAGE] HTTP Error ${response.statusCode} for ${config.BASE_URL}${page}`);
            return [];
        }

        const $ = cheerio.load(response.body);
        const links = $('#list_catalog a').map((_, el) => $(el).attr('href')).get().filter(Boolean);

        if (links.length === 0) {
            const title = $('title').text().trim();
            console.warn(`[PAGE] No links found on page ${page}. Page title : "${title}"`);
            if (title.includes('Just a moment') || title.includes('Cloudflare')) {
                console.error('[PAGE] Cloudflare detection (Challenge/Captcha).');
            }
        }

        return links;
    } catch (e) {
        console.error(`[PAGE] ${config.BASE_URL}${page} | fetchLinksFromPage Error: ${e.message}`);
        logError(`[PAGE] ${config.BASE_URL}${page} | fetchLinksFromPage Error: ${e.message}`);
        return [];
    }
}

function parseEpisodeNames(scriptContent, maxEpisodes = 0) {
    let episodeNames = [];
    let currentNum = 1;
    let lastNum = 0;
    const lines = scriptContent.split(';').map(l => l.trim()).filter(Boolean);
    for (let line of lines) {
        if (/^creerListe\s*\(/.test(line)) {
            const match = /creerListe\((\d+),\s*(\d+)\)/.exec(line);
            if (match) {
                const start = parseInt(match[1], 10);
                const end = parseInt(match[2], 10);
                for (let i = start; i <= end; i++) {
                    episodeNames.push(`Episode ${i}`);
                    lastNum = i;
                }
                currentNum = end + 1;
            }
        } else if (/^newSPF\s*\(/.test(line)) {
            const match = /newSPF\(["'](.+?)["']\)/.exec(line);
            if (match) {
                episodeNames.push(match[1]);
                currentNum = lastNum + 1;
            }
        } else if (/finirListeOP\s*\(/.test(line)) {
            const match = /finirListeOP\((\d+)\)/.exec(line);
            if (match) {
                const start = parseInt(match[1], 10);
                // For finirListeOP, generate episodes up to max found in episodes.js
                for (let i = start; i < start + maxEpisodes; i++) {
                    episodeNames.push(`Episode ${i}`);
                    lastNum = i;
                }
                currentNum = start + maxEpisodes;
            }
        }
    }
    return episodeNames;
}

async function fetchEpisodesForSeason(seasonHref, baseAnimeUrl) {
    let logContext = `[SAISON] ${baseAnimeUrl} | ${seasonHref}`;
    let base = (baseAnimeUrl.startsWith('http') ? baseAnimeUrl : `https://anime-sama.org${baseAnimeUrl}`).trim();
    base = base.replace(/\/$/, '');
    let href = seasonHref.trim();
    href = href.startsWith('/') ? href : '/' + href;
    let url = (base + href).replace(/\/+/, '/').replace(/([^:])\/\//g, '$1/').replace(':/', '://');
    if (!url.endsWith('/')) url += '/';
    const episodesJsUrl = (url + 'episodes.js').replace(/\/+/g, '/').replace(/([^:])\/\//g, '$1/').replace(':/', '://');
    let jsContent = '';
    let episodeNames = [];
    const { gotScraping } = await import('got-scraping');
    try {
        const options = { url };
        if (config.PROXY_URL) options.proxyUrl = config.PROXY_URL;
        const { body: saisonHtml } = await gotScraping(options);
        const $ = cheerio.load(saisonHtml);
        let foundScript = null;
        $('script').each((_, el) => {
            const scriptText = $(el).html();
            if (scriptText && /creerListe|newSPF|finirListeOP/.test(scriptText)) {
                foundScript = scriptText;
                return false;
            }
        });
        if (foundScript) {
            // First parse without maxEpisodes to see if there is finirListeOP
            const tempNames = parseEpisodeNames(foundScript, 0);
            // If we detect finirListeOP but not yet the players, we will wait
            episodeNames = tempNames;
        }
    } catch (e) {
        logError(`${logContext} | Error downloading season page: ${e.message}`);
    }
    try {
        const options = { url: episodesJsUrl };
        const res = await gotScraping(options);
        jsContent = res.body;
    } catch (e) {
        logError(`${logContext} | No episodes.js file (${episodesJsUrl})`);
        return [];
    }
    const lecteurRegex = /(var|let|const)\s+(eps\d*)[ \t\r\n]*=[ \t\r\n]*\[([\s\S]*?)\][ \t\r\n]*;?/g;
    let lecteurs = {};
    let match;
    while ((match = lecteurRegex.exec(jsContent)) !== null) {
        const lecteur = match[2];
        if (lecteur.toLowerCase() === 'epsas') continue;
        const urls = [];
        const arrayContent = match[3];
        const urlRegex = /['"]([^'"]+)['"]/g;
        let urlMatch;
        while ((urlMatch = urlRegex.exec(arrayContent)) !== null) {
            urls.push(urlMatch[1].trim());
        }
        lecteurs[lecteur] = urls;
    }
    const maxEpisodes = Math.max(...Object.values(lecteurs).map(arr => arr.length), 0);
    if (Object.keys(lecteurs).length === 0) {
        logError(`${logContext} | No player found in episodes.js`);
    }
    if (episodeNames.length === 0 && Object.keys(lecteurs).length === 0) {
        logError(`${logContext} | No episode found (neither names nor players)`);
    }
    if (maxEpisodes === 0) {
        logError(`${logContext} | Season without episodes`);
    }
    if (episodeNames.length === 0) {
        const creerListeScriptMatch = jsContent.match(/creerListe\([\s\S]*?\);[\s\S]*?(newSPF\([\s\S]*?\);)?/g);
        if (creerListeScriptMatch) {
            episodeNames = parseEpisodeNames(creerListeScriptMatch.join(';'), maxEpisodes);
        }
    }

    // If we found finirListeOP in HTML script but now have maxEpisodes, re-parse
    try {
        const options = { url };
        const { body: saisonHtml } = await gotScraping(options);
        const $ = cheerio.load(saisonHtml);
        let foundScript = null;
        $('script').each((_, el) => {
            const scriptText = $(el).html();
            if (scriptText && /finirListeOP/.test(scriptText)) {
                foundScript = scriptText;
                return false;
            }
        });
        if (foundScript && maxEpisodes > 0) {
            episodeNames = parseEpisodeNames(foundScript, maxEpisodes);
        }
    } catch (e) {
        // Ignore re-parsing errors
    }
    if (episodeNames.length < maxEpisodes) {
        let lastNum = 0;
        for (let i = episodeNames.length - 1; i >= 0; i--) {
            const m = episodeNames[i].match(/^Episode (\d+)$/);
            if (m) {
                lastNum = parseInt(m[1], 10);
                break;
            }
        }
        for (let i = episodeNames.length; i < maxEpisodes; i++) {
            lastNum++;
            episodeNames.push(`Episode ${lastNum}`);
        }
    }
    let episodes = [];
    let saisonLang = null;
    for (const l of config.LANGS) {
        const regex = new RegExp(`([\/\-_\.\?#]|^)${l}([\/\-_\.\?#]|$)`, 'i');
        if (regex.test(seasonHref)) {
            saisonLang = l;
            break;
        }
    }
    for (let i = 0; i < maxEpisodes; i++) {
        let lecteursArray = [];
        for (const lecteur in lecteurs) {
            if (lecteurs[lecteur][i]) {
                const url = lecteurs[lecteur][i];
                let lang = null;
                // First search for vf1/vf2 explicitly in URL
                for (const l of ['vf1', 'vf2']) {
                    const regex = new RegExp(`([\\/\\-_.\\?#]|^)${l}([\\/\\-_.\\?#]|$)`, 'i');
                    if (regex.test(url)) {
                        lang = l;
                        break;
                    }
                }
                // Otherwise, search all other languages
                if (!lang) {
                    for (const l of config.LANGS) {
                        if (['vf1', 'vf2'].includes(l)) continue;
                        const regex = new RegExp(`([\\/\\-_.\\?#]|^)${l}([\\/\\-_.\\?#]|$)`, 'i');
                        if (regex.test(url)) {
                            lang = l;
                            break;
                        }
                    }
                }
                // If no language found in URL, use season language (which can be vf1/vf2)
                if (!lang && saisonLang) lang = saisonLang;
                lecteursArray.push({ lecteur, url, lang });
            }
        }
        episodes.push({ nom: episodeNames[i] || `Episode ${i + 1}`, lecteurs: lecteursArray });
    }
    return episodes;
}

async function fetchInfos(url) {
    try {
        const { gotScraping } = await import('got-scraping');
        url = url.trim();
        const options = { url: url.startsWith('http') ? url : `https://anime-sama.org${url}` };
        const { body } = await gotScraping(options);
        const $ = cheerio.load(body);
        const titre = $('#titreOeuvre').text().trim();
        const titreAlterText = $('#titreAlter').text().trim();
        const titresAlter = titreAlterText ? titreAlterText.split(',').map(t => t.trim()).filter(Boolean) : [];
        let synopsis = '';
        const h2Synopsis = $('h2.text-white.text-xl.font-bold.uppercase.border-b-2.mb-3.mt-5.border-slate-700').filter((_, el) => $(el).text().trim().toLowerCase() === 'synopsis');
        if (h2Synopsis.length > 0) {
            const p = h2Synopsis.first().next('p');
            if (p.length > 0) synopsis = p.text().trim();
        }
        let genres = [];
        const h2Genres = $('h2.text-white.text-xl.font-bold.uppercase.border-b-2.mb-3.mt-5.border-slate-700').filter((_, el) => $(el).text().trim().toLowerCase() === 'genres');
        if (h2Genres.length > 0) {
            let next = h2Genres.first().next();
            let tries = 0;
            while (next.length && next[0].tagName !== 'a' && tries < 3) {
                next = next.next();
                tries++;
            }
            while (next.length && next[0].tagName === 'a') {
                const genreText = next.text().trim();
                if (genreText) genreText.split(',').map(g => g.trim()).filter(Boolean).forEach(g => genres.push(g));
                next = next.next();
            }
        }
        let animeLinks = [];
        let ordre = 1;
        const h2Anime = $('h2.text-white.text-xl.font-bold.uppercase.border-b-2.mt-5.border-slate-500').filter((_, el) => $(el).text().trim().toLowerCase() === 'anime');
        if (h2Anime.length > 0) {
            let next = h2Anime.first().next();
            let tries = 0;
            while (next.length && next[0].tagName !== 'div' && tries < 3) {
                next = next.next();
                tries++;
            }
            if (next.length && next[0].tagName === 'div') {
                const script = next.find('script');
                if (script.length > 0) {
                    let scriptContent = script.html();
                    if (scriptContent) {
                        scriptContent = scriptContent.replace(/\/\*[\s\S]*?\*\//g, '');
                        scriptContent.split('\n').forEach(line => {
                            const trimmed = line.trim();
                            if (/^panneauAnime\s*\(/.test(trimmed)) {
                                const match = /^panneauAnime\(["']([^"']+)["'],\s*["']([^"']+)["']\)/.exec(trimmed);
                                if (match) {
                                    animeLinks.push({ href: match[2].trim(), nom: match[1].trim(), ordre });
                                    ordre++;
                                }
                            }
                        });
                    }
                }
            }
        }
        if (!animeLinks || animeLinks.length === 0) {
            logError(`[ANIME] ${url} | No seasons found`);
        }
        let allSaisons = [];
        for (const saison of animeLinks) {
            const langs = await checkLangsForSeason(saison.href.trim(), url);
            for (const lang of Object.keys(langs)) {
                if (langs[lang]) {
                    let baseHref = saison.href.trim().replace(/\/?(vf|vj|vcn|vqc|vkr|va|vf1|vf2|vostfr)$/i, '');
                    if (baseHref.endsWith('/')) baseHref = baseHref.slice(0, -1);
                    let langHref = baseHref ? `${baseHref}/${lang}` : lang;
                    langHref = langHref.replace(/\/+/, '/').replace(/([^:])\/\//g, '$1/').replace(':/', '://');
                    try {
                        const episodes = await fetchEpisodesForSeason(langHref, url);
                        allSaisons.push({ ...saison, href: langHref, lang, episodes, langs });
                    } catch (e) {
                        logError(`[SAISON] ${url} | ${langHref} | fetchEpisodesForSeason Error: ${e.message}`);
                    }
                }
            }
        }
        return { titre, titresAlter, synopsis, genres, animeLinks: allSaisons };
    } catch (e) {
        logError(`[ANIME] ${url} | fetchInfos Error: ${e.message}`);
        return { titre: '', titresAlter: [], synopsis: '', genres: [] };
    }
}

module.exports = {
    fetchLinksFromPage,
    fetchInfos,
    getPoster,
    checkLangsForSeason,
    fetchEpisodesForSeason
};
