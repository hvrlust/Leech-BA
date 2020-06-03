const {generateCommandList, DEFAULT_PREFIX} = require("../utils");
module.exports = {
    name: 'help',
    description: '',
    parameters: [],
    help: 'example use: `' + DEFAULT_PREFIX + 'help confirm`. If you\'re looking for the command list, use /commands',
    permittedRoles: [],
    execute: async (bot, message) => {
        const command = params.args[1];
        if(params.args.length < 2 || !bot.commands.has(command)) {
            message.channel.send(module.exports.help);
            return;
        }
        await message.channel.send(bot.commands.get(command).help).catch(e => {
            console.error(e);
        });
    }
};
