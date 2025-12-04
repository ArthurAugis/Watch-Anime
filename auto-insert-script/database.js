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
    // After attempts exhausted, throw the last error
    const finalMsg = `[DB] Impossible de se connecter après ${maxAttempts} tentatives: ${lastErr && lastErr.message ? lastErr.message : lastErr}`;
    console.error(finalMsg);
    logError(finalMsg);
    throw lastErr || new Error(finalMsg);
}

module.exports = {
    validateDbEnv,
    connectWithRetries
};
