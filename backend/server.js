const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

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