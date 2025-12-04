const fs = require('fs');
const config = require('./config');

function logError(msg) {
    fs.appendFileSync(config.LOG_FILE, msg + '\n', 'utf-8');
}

module.exports = { logError };
