const dotenv = require('dotenv');
const fs = require('fs');

const dotenvResult = dotenv.config();

// Log all variables present in the .env file to the console for debugging
function logEnvFromDotenv(parsed) {
    try {
        if (!parsed || Object.keys(parsed).length === 0) {
            console.log('[ENV] No .env file found or no content parsed.');
            return;
        }
        console.log('[ENV] Variables loaded from .env :');
        for (const [k, v] of Object.entries(parsed)) {
            console.log(`[ENV] ${k}=${v}`);
        }
    } catch (e) {
        console.warn('[ENV] Error displaying .env :', e && e.message ? e.message : e);
    }
}

if (dotenvResult && dotenvResult.parsed) {
    logEnvFromDotenv(dotenvResult.parsed);
} else {
    // Fallback: try to read .env manually (best-effort) and parse it
    try {
        const envFile = fs.readFileSync('.env', 'utf8');
        const parsed = dotenv.parse(envFile);
        logEnvFromDotenv(parsed);
    } catch (e) {
        console.log('[ENV] .env missing or inaccessible.');
    }
}

module.exports = {
    BASE_URL: 'https://anime-sama.org/catalogue/?type%5B0%5D=Anime&search=&page=',
    LANGS: ['vf', 'vj', 'vcn', 'vqc', 'vkr', 'va', 'vf1', 'vf2', 'vostfr'],
    LOG_FILE: 'logs.txt',
    DB: {
        host: process.env.db_host,
        port: process.env.db_port ? Number(process.env.db_port) : undefined,
        user: process.env.db_user,
        password: process.env.db_pass,
        database: process.env.db_name,
        multipleStatements: true
    }
};