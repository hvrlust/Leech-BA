const {generateCommandList, ADMIN_PREFIX} = require("../utils");
module.exports = {
    name: 'commands',
    description: 'displays this list of super mod commands',
    help: 'example usage `'+ADMIN_PREFIX+'commands`',
    parameters: ['-all'],
    permittedRoles: ["stuff", "Server admin", "developer"],
    execute: async (bot, message, params) => {
        let response = generateCommandList(ADMIN_PREFIX, bot.adminCommands, message.member, params.args[1] === '-all');
        await message.channel.send(response);
    }
};
