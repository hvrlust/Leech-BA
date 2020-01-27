const args = process.argv.slice(2);
let configFile = './config.json';
if(args[0] === "--config" && args.length > 1) {
    configFile = args[1]
}

const fs = require('fs');
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const Database = require('./src/database');
const database = new Database();

// the token of your bot - https://discordapp.com/developers/applications/me
const bot = require("./src/discord/bot");

const MAIL_CLIENT = {
    username: config['email'], //email client details
    password: config['password'],
    host: 'imap.gmail.com' // Host server.  See server that your mail client uses.
};
bot.run(config['token'], MAIL_CLIENT, database);

const site = require("./src/site/main");
site.run(database);