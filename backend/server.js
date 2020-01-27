const Database = require('./src/database');
const database = new Database();

// the token of your bot - https://discordapp.com/developers/applications/me
const bot = require("./src/discord/bot");
const token = ''; //for token in commerical use

const site = require("./src/site/main");
bot.run(token, database)
    .then((c) => {
        site.run(database, c.adminChannel, c.queueChannel);
    });