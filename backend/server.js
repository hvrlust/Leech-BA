const args = process.argv.slice(2);
let configFile = './config.json';
if(args[0] === "--config" && args.length > 1) {
    configFile = args[1]
}

const fs = require('fs');
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const Database = require('./src/database');
const database = new Database(config['dbPath']);

// the token of your bot - https://discordapp.com/developers/applications/me
const bot = require("./src/discord/bot");

const site = require("./src/site/main");
bot.run(config['token'], database).then(() => {});
site.run(database, bot.getQueueChannel);