const {generateCommandList, DEFAULT_PREFIX} = require("../utils");
module.exports = {
    name: 'commands',
    description: 'displays this list of commands the person called me can use',
    parameters: [],
    help: 'self explanatory',
    permittedRoles: [],
    execute: async (bot, message) => {
        let response = generateCommandList(DEFAULT_PREFIX, bot.commands, message.member);
        await message.channel.send(response);
    }
};
