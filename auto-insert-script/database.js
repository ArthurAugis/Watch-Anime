const mysql = require('mysql2/promise');
const config = require('./config');
const { logError } = require('./logger');

// Validate required DB environment variables and provide clearer error messages
function validateDbEnv() {
    const required = ['db_host', 'db_user', 'db_pass', 'db_name'];
    // Check against config object instead of process.env directly to ensure config is correct
    // But config.DB maps to process.env, so we can check config.DB values or process.env
    // Let's check process.env as in original code for simplicity, or check config.DB properties
    const missing = [];
    if (!config.DB.host) missing.push('db_host');
    if (!config.DB.user) missing.push('db_user');
    if (!config.DB.password) missing.push('db_pass');
    if (!config.DB.database) missing.push('db_name');

    if (missing.length) {
        const msg = `[DB] Missing environment variables: ${missing.join(', ')}`;
        console.error(msg);
        logError(msg);
        throw new Error(msg);
    }
}

// Attempt to connect to the database with retries and backoff
async function connectWithRetries(maxAttempts = 3, delayMs = 2000) {
    let lastErr = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`[DB] Connecting to DB (${attempt}/${maxAttempts})...`);
            const conn = await mysql.createConnection(config.DB);
            console.log('[DB] DB connection established.');
            return conn;
        } catch (err) {
            lastErr = err;
            const short = err && err.code ? `${err.code}` : err.message || String(err);
            const msg = `[DB] Connection error (attempt ${attempt}): ${short}`;
            console.error(msg);
            logError(msg);
            if (attempt < maxAttempts) {
                // Exponential-ish backoff
                const waitMs = delayMs * attempt;
                console.log(`[DB] Retrying in ${Math.round(waitMs / 1000)}s...`);
                await new Promise(res => setTimeout(res, waitMs));
            }
        }
    }
    // After attempts exhausted, throw the last error
    const finalMsg = `[DB] Unable to connect after ${maxAttempts} attempts: ${lastErr && lastErr.message ? lastErr.message : lastErr}`;
    console.error(finalMsg);
    logError(finalMsg);
    throw lastErr || new Error(finalMsg);
}

module.exports = {
    validateDbEnv,
    connectWithRetries
};
