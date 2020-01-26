const Database = require('./src/database');
const database = new Database();

// the token of your bot - https://discordapp.com/developers/applications/me
const bot = require("./src/discord/bot");
const token = '';

const MAIL_CLIENT = {
    username: '', //email client details
    password: '',
    host: '' // Host server.  See server that your mail client uses.
};
bot.run(token, MAIL_CLIENT, database);

const site = require("./src/site/main");
site.run(database);