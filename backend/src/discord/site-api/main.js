const CommandHandler = require('./commandhandler');
const commandUtils = require('../common/command-utils');


exports.run = function (bot, database, guildId) {
    this.commandHandler = new CommandHandler(database);
    bot.on('message', message => {
        if(message.guild === null || message.guild.id !== guildId) {
            return;
        }

        const args = message.content.split(" ");
        if (args[0].startsWith(commandUtils.DEFAULTPREFIX)) {
            this.commandHandler.handleCommand(message, args);
        }
        if (args[0].startsWith(commandUtils.ADMINPREFIX)) {
            this.commandHandler.handleAdminCommand(message, args);
        }
    });
};