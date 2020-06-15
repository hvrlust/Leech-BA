const {DEFAULT_PREFIX} = require("../utils");
module.exports = {
    name: 'help',
    description: 'provides example usage and parameter descriptions given a command',
    parameters: [],
    help: 'example use: `' + DEFAULT_PREFIX + 'help commands`. If you\'re looking for the command list, use /commands',
    permittedRoles: [],
    execute: async (bot, message, params) => {
        const command = params.args[1];
        if(params.args.length < 2 || !bot.commands.has(command)) {
            await message.channel.send(module.exports.help);
            return;
        }
        await message.channel.send(bot.commands.get(command).help).catch(e => {
            console.error(e);
        });
    }
};
