const sharp = require('sharp');
const SftpClient = require('ssh2-sftp-client');
const dotenv = require('dotenv');

dotenv.config();

const SFTP_CONFIG = {
  host: process.env.host_ssh,
  port: process.env.port_ssh || 22,
  username: process.env.user_ssh,
  password: process.env.pass_ssh,
};
const SFTP_COVERS_PATH = process.env.SFTP_COVERS_PATH || '/path/to/cdn/images/anime';

async function downloadAndUploadCover(imageUrl, destFileName) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const webpBuffer = await sharp(response.data).webp().toBuffer();
    const sftp = new SftpClient();
    await sftp.connect(SFTP_CONFIG);
    try {
      await sftp.mkdir(SFTP_COVERS_PATH, true);
    } catch (err) {
      if (!/Failure|exists/i.test(err.message)) throw err;
    }
    await sftp.put(webpBuffer, `${SFTP_COVERS_PATH}/${destFileName}`);
    await sftp.end();
    console.log(`Cover uploadée : ${destFileName}`);
  } catch (e) {
    logError(`[COVER] Erreur download/upload : ${imageUrl} => ${destFileName} | ${e.message}`);
    console.error(`[COVER] Erreur download/upload : ${imageUrl} => ${destFileName} | ${e.message}`);
  }
}
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, InteractionType, Partials } = require('discord.js');
const DISCORD_BOT_TOKEN = process.env.discord_token;
const DISCORD_USER_ID = process.env.discord_user_id;
const DISCORD_CLIENT_ID = process.env.discord_client_id;
let discordClient = null;
let discordReady = false;

async function registerSlashCommand() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
  const cmd = new SlashCommandBuilder()
    .setName('change-affiche')
    .setDescription("Change l'affiche d'un animé dans la base de données")
    .addStringOption(option =>
      option.setName('anime').setDescription('nom_url de l\'animé').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('url').setDescription('Nouvelle URL de l\'affiche').setRequired(true)
    );
  await rest.post(
    Routes.applicationCommands(DISCORD_CLIENT_ID),
    { body: cmd.toJSON() }
  );
  console.log('Slash command /change-affiche enregistrée/actualisée');
}

async function startDiscordBot() {
  if (discordClient) return;
  discordClient = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent], partials: [Partials.Channel] });
  discordClient.once('ready', () => {
    discordReady = true;
    console.log('Bot Discord prêt.');
  });
  discordClient.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ApplicationCommand) return;
    if (interaction.commandName === 'change-affiche') {
      if (interaction.user.id !== DISCORD_USER_ID) {
        await interaction.reply({ content: `Commande réservée à l'administrateur.`, ephemeral: true });
        return;
      }
      const nom_url = interaction.options.getString('anime');
      const url = interaction.options.getString('url');
      let db;
      try {
        db = await require('mysql2/promise').createConnection({
          host: process.env.db_host,
          user: process.env.db_user,
          password: process.env.db_pass,
          database: process.env.db_name || "watch_anime_db",
        });
        const [rows] = await db.query('SELECT id FROM tab_liste_anime WHERE nom_url = ?', [nom_url]);
        if (rows.length === 0) {
          await interaction.reply({ content: `Aucun animé trouvé avec nom_url : ${nom_url}`, ephemeral: true });
        } else {
          await db.query('UPDATE tab_liste_anime SET affiche_url = ? WHERE nom_url = ?', [url, nom_url]);
          await interaction.reply({ content: `Affiche de l'animé ${nom_url} mise à jour !`, ephemeral: true });
        }
      } catch (e) {
        await interaction.reply({ content: `Erreur : ${e.message}`, ephemeral: true });
      } finally {
        if (db) await db.end();
      }
    }
  });
  await discordClient.login(DISCORD_BOT_TOKEN);
  await registerSlashCommand();
}

async function sendDiscordDM(message) {
  try {
    const user = await discordClient.users.fetch(DISCORD_USER_ID);
    await user.send(message);
  } catch (e) {
    logError(`[DISCORD] Erreur envoi MP: ${e.message}`);
  }
}

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const mysql = require('mysql2/promise');

const LOG_FILE = 'logs.txt';
function logError(msg) {
  fs.appendFileSync(LOG_FILE, msg + '\n', 'utf-8');
}

const BASE_URL = 'https://anime-sama.fr/catalogue/?type%5B0%5D=Anime&search=&page=';
const LANGS = ['vf', 'vj', 'vcn', 'vqc', 'vkr', 'va', 'vf1', 'vf2', 'vostfr'];

function detectLangFromHref(href) {
  for (const lang of LANGS) {
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
  for (const lang of LANGS) {
    if (lang === detectedLang) {
      results[lang] = true;
      continue;
    }
    let url = `${baseAnimeUrl.trim().replace(/\/$/, '')}/${base}/${lang}`;
    url = url.replace(/\/+/, '/').replace(/([^:])\/\//g, '$1/').replace(':/', '://');
    try {
      const res = await axios.get(url, { validateStatus: () => true });
      results[lang] = res.status !== 404;
    } catch {
      results[lang] = false;
    }
  }
  return results;
}

async function getPoster(titre) {
  try {
    const res = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(titre)}`);
    const d = res.data;
    if (d?.data?.length) return d.data[0].attributes.posterImage?.original || null;
  } catch {}
  try {
    const res = await axios.get(`https://api.jikan.moe/v4/anime`, { params: { q: titre, limit: 1 } });
    const d = res.data;
    if (d?.data?.length) return d.data[0].images?.jpg?.large_image_url || d.data[0].images?.jpg?.image_url || null;
  } catch {}
  try {
    const query = `query ($search: String) { Media(search: $search, type: ANIME) { coverImage { extraLarge large medium } } }`;
    const res = await axios.post('https://graphql.anilist.co', { query, variables: { search: titre } }, { headers: { 'Content-Type': 'application/json' } });
    const img = res.data?.data?.Media?.coverImage;
    return img?.extraLarge || img?.large || img?.medium || null;
  } catch {}
  return null;
}



async function fetchLinksFromPage(page) {
  try {
    const { data } = await axios.get(`${BASE_URL}${page}`);
    const $ = cheerio.load(data);
    return $('#list_catalog a').map((_, el) => $(el).attr('href')).get().filter(Boolean);
  } catch (e) {
    logError(`[PAGE] ${BASE_URL}${page} | Erreur fetchLinksFromPage: ${e.message}`);
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
  let base = (baseAnimeUrl.startsWith('http') ? `${baseAnimeUrl}` : `https://anime-sama.fr${baseAnimeUrl}`).trim();
  base = base.replace(/\/$/, '');
  let href = seasonHref.trim();
  href = href.startsWith('/') ? href : '/' + href;
  let url = (base + href).replace(/\/+/, '/').replace(/([^:])\/\//g, '$1/').replace(':/', '://');
  if (!url.endsWith('/')) url += '/';
  const episodesJsUrl = (url + 'episodes.js').replace(/\/+/g, '/').replace(/([^:])\/\//g, '$1/').replace(':/', '://');
  let jsContent = '';
  let episodeNames = [];
  try {
    const { data: saisonHtml } = await axios.get(url);
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
      const tempNames = parseEpisodeNames(foundScript, 0);
      episodeNames = tempNames;
    }
  } catch (e) {
    logError(`${logContext} | Erreur téléchargement page saison: ${e.message}`);
  }
  try {
    const res = await axios.get(episodesJsUrl);
    jsContent = res.data;
  } catch (e) {
    logError(`${logContext} | Pas de fichier episodes.js (${episodesJsUrl})`);
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
    logError(`${logContext} | Aucun lecteur trouvé dans episodes.js`);
  }
  if (episodeNames.length === 0 && Object.keys(lecteurs).length === 0) {
    logError(`${logContext} | Aucun episode trouvé (ni noms ni lecteurs)`);
  }
  if (maxEpisodes === 0) {
    logError(`${logContext} | Saison sans épisodes`);
  }
  if (episodeNames.length === 0) {
    const creerListeScriptMatch = jsContent.match(/creerListe\([\s\S]*?\);[\s\S]*?(newSPF\([\s\S]*?\);)?/g);
    if (creerListeScriptMatch) {
      episodeNames = parseEpisodeNames(creerListeScriptMatch.join(';'), maxEpisodes);
    }
  }
  
  try {
    const { data: saisonHtml } = await axios.get(url);
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
  for (const l of LANGS) {
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
        for (const l of ['vf1', 'vf2']) {
          const regex = new RegExp(`([\\/\\-_.\\?#]|^)${l}([\\/\\-_.\\?#]|$)`, 'i');
          if (regex.test(url)) {
            lang = l;
            break;
          }
        }
        if (!lang) {
          for (const l of LANGS) {
            if (['vf1', 'vf2'].includes(l)) continue;
            const regex = new RegExp(`([\\/\\-_.\\?#]|^)${l}([\\/\\-_.\\?#]|$)`, 'i');
            if (regex.test(url)) {
              lang = l;
              break;
            }
          }
        }
        if (!lang && saisonLang) lang = saisonLang;
        lecteursArray.push({ lecteur, url, lang });
      }
    }
    episodes.push({ nom: episodeNames[i] || `Episode ${i+1}`, lecteurs: lecteursArray });
  }
  return episodes;
}

async function fetchInfos(url) {
  try {
    url = url.trim();
    const { data } = await axios.get(url.startsWith('http') ? url : `https://anime-sama.fr${url}`);
    const $ = cheerio.load(data);
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
      logError(`[ANIME] ${url} | Pas de saisons trouvées`);
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
            logError(`[SAISON] ${url} | ${langHref} | Erreur fetchEpisodesForSeason: ${e.message}`);
          }
        }
      }
    }
    return { titre, titresAlter, synopsis, genres, animeLinks: allSaisons };
  } catch (e) {
    logError(`[ANIME] ${url} | Erreur fetchInfos: ${e.message}`);
    return { titre: '', titresAlter: [], synopsis: '', genres: [] };
  }
}



async function main() {
  try {
    const db = await mysql.createConnection({
      host: process.env.db_host,
      user: process.env.db_user,
      password: process.env.db_pass,
      database: process.env.db_name || "watch_anime_db",
      multipleStatements: true
    });

    let page = 1;
    let allLinks = [];
    while (true) {
      const links = await fetchLinksFromPage(page);
      if (!links.length) break;
      allLinks.push(...links);
      console.log(`Page ${page} : ${links.length} liens trouvés.`);
      page++;
    }
    allLinks = [...new Set(allLinks)];
    const max = 9999999999;
    const results = [];

    const animeCache = new Map();
    const saisonCache = new Map();
    const langueCache = new Map();
    const episodeCache = new Map();
    const categorieCache = new Map();

    const [langRows] = await db.query('SELECT id, nom FROM tab_langues');
    for (const row of langRows) langueCache.set(row.nom, row.id);

    const [catRows] = await db.query('SELECT id, nom FROM tab_categories');
    for (const row of catRows) categorieCache.set(row.nom, row.id);

    const foundAnimeNomUrl = new Set();
    const foundSaisonKey = new Set(); 
    const foundEpisodeKey = new Set(); 
    const foundLecteurKey = new Set(); 

    for (const [i, link] of allLinks.slice(0, max).entries()) {
      const cleanLink = link.trim().replace(/\/+/, '/').replace(/([^:])\/\//g, '$1/').replace(':/', '://');
      console.log(`Récupération des infos ${i + 1}/${Math.min(allLinks.length, max)} : ${cleanLink}`);
      const infos = await fetchInfos(cleanLink);
      const poster = await getPoster(infos.titre);
      await Promise.all(infos.animeLinks.map(async saison => {
        saison.langs = await checkLangsForSeason(saison.href.trim(), cleanLink);
      }));
      results.push({ url: cleanLink, ...infos, poster });

      let animeId;
      const nom_url_anime = infos.titre
        .replace(/['",:;\.\?!\(\)\[\]\{\}]/g, '') 
        .replace(/\s+/g, '-')
        .toLowerCase();
      foundAnimeNomUrl.add(nom_url_anime);
      const defaultPoster = 'https://i.seadn.io/gae/2hDpuTi-0AMKvoZJGd-yKWvK4tKdQr_kLIpB_qSeMau2TNGCNidAosMEvrEXFO9G6tmlFlPQplpwiqirgrIPWnCKMvElaYgI-HiVvXc?auto=format&dpr=1&w=1000';
      let posterToUse = poster || defaultPoster;
      if (!posterToUse) posterToUse = defaultPoster;
      const [animeRows] = await db.query('SELECT id, affiche_url, nom_url, description FROM tab_liste_anime WHERE nom_url = ?', [nom_url_anime]);
      if (animeRows.length > 0) {
        animeId = animeRows[0].id;
        if (poster && poster !== defaultPoster && poster !== animeRows[0].affiche_url) {
          await db.query('UPDATE tab_liste_anime SET affiche_url = ? WHERE id = ?', [poster, animeId]);
          const destFileName = `${nom_url_anime}.webp`;
          await downloadAndUploadCover(poster, destFileName);
        }
        if (!animeRows[0].affiche_url || animeRows[0].affiche_url === defaultPoster) {
          await db.query('UPDATE tab_liste_anime SET affiche_url = ? WHERE id = ?', [posterToUse, animeId]);
          const destFileName = `${nom_url_anime}.webp`;
          await downloadAndUploadCover(posterToUse, destFileName);
        }
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
        const destFileName = `${nom_url_anime}.webp`;
        await downloadAndUploadCover(posterToUse, destFileName);
        if (posterToUse === defaultPoster) {
          await sendDiscordDM(`Nouvel animé inséré avec affiche par défaut : ${infos.titre} (nom_url: ${nom_url_anime})`);
        }
      }

      for (const subname of infos.titresAlter) {
        const [subRows] = await db.query('SELECT * FROM tab_subname WHERE anime = ? AND subname = ?', [animeId, subname]);
        if (subRows.length === 0) {
          await db.query('INSERT INTO tab_subname (anime, subname) VALUES (?, ?)', [animeId, subname]);
        }
      }

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

      const saisonOrderMap = new Map();
      infos.animeLinks.forEach((saison, idx) => {
        const nom_url_saison = saison.nom
          .replace(/['",:;\.\?!\(\)\[\]\{\}]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase();
        saisonOrderMap.set(nom_url_saison, saison.ordre || (idx + 1));
      });
      const [dbSaisons] = await db.query('SELECT id, nom_url, numero FROM tab_saisons WHERE anime = ?', [animeId]);
      for (const dbSaison of dbSaisons) {
        const newOrder = saisonOrderMap.get(dbSaison.nom_url);
        if (newOrder && dbSaison.numero !== newOrder) {
          await db.query('UPDATE tab_saisons SET numero = ? WHERE id = ?', [newOrder, dbSaison.id]);
        }
      }
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

        for (const [epIdx, episode] of saison.episodes.entries()) {
          let langueId;
          let langRaw = episode.lecteurs[0]?.lang || saison.lang || 'vostfr';
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

          const nom_url_episode = episode.nom.replace(/\s+/g, '-').toLowerCase();
          foundEpisodeKey.add(`${saisonId}|||${langueId}|||${nom_url_episode}`);
          const [dbEpisodes] = await db.query('SELECT id, nom_url, numero FROM tab_episodes WHERE saison = ? AND langue = ?', [saisonId, langueId]);
          if (epIdx === 0) {
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

          for (const [lectIdx, lecteur] of episode.lecteurs.entries()) {
            foundLecteurKey.add(`${episodeId}|||${lectIdx + 1}`);
            
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
              if (lectRows[0].url_episode !== processedUrl) {
                await db.query('UPDATE lecteurs SET url_episode = ? WHERE id_episode = ? AND nb_lecteur = ?', [processedUrl, episodeId, lectIdx + 1]);
              }
            }
          }
        }
      }
    }

    const [allLecteurs] = await db.query('SELECT id_episode, nb_lecteur FROM lecteurs');
    for (const lecteur of allLecteurs) {
      if (!foundLecteurKey.has(`${lecteur.id_episode}|||${lecteur.nb_lecteur}`)) {
        await db.query('DELETE FROM lecteurs WHERE id_episode = ? AND nb_lecteur = ?', [lecteur.id_episode, lecteur.nb_lecteur]);
      }
    }
    const [allEpisodes] = await db.query('SELECT id, saison, langue, nom_url FROM tab_episodes');
    for (const ep of allEpisodes) {
      if (!foundEpisodeKey.has(`${ep.saison}|||${ep.langue}|||${ep.nom_url}`)) {
        await db.query('DELETE FROM tab_episodes WHERE id = ?', [ep.id]);
      }
    }
    const [allSaisons] = await db.query('SELECT id, anime, nom_url FROM tab_saisons');
    for (const saison of allSaisons) {
      if (!foundSaisonKey.has(`${saison.anime}|||${saison.nom_url}`)) {
        await db.query('DELETE FROM tab_saisons WHERE id = ?', [saison.id]);
      }
    }
    const [allAnimes] = await db.query('SELECT id, nom_url FROM tab_liste_anime');
    for (const anime of allAnimes) {
      if (!foundAnimeNomUrl.has(anime.nom_url)) {
        await db.query('DELETE FROM tab_liste_anime WHERE id = ?', [anime.id]);
      }
    }

    fs.writeFileSync('liens_catalogue.json', JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Terminé. ${results.length} fiches enregistrées dans liens_catalogue.json et insérées en base.`);
    await db.end();
  } catch (err) {
    logError(`[MAIN] Erreur inattendue : ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
    console.error('[MAIN] Erreur inattendue :', err);
    throw err;
  }
}

startDiscordBot();

async function runMainWithLog() {
  try {
    console.log(`[CRON] Lancement du scraping à ${new Date().toLocaleString()}`);
    await main();
    console.log(`[CRON] Scraping terminé à ${new Date().toLocaleString()}`);
  } catch (e) {
    logError(`[CRON] Erreur lors du scraping : ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
    console.error('[CRON] Erreur lors du scraping :', e);
  }
}

runMainWithLog();
setInterval(runMainWithLog, 1.5 * 60 * 60 * 1000);