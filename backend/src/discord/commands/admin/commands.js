const {generateCommandList, ADMIN_PREFIX} = require("../utils");
module.exports = {
    name: 'commands',
    description: 'displays this list of super mod commands',
    parameters: [],
    permittedRoles: ["stuff", "Server admin", "developer"],
    execute: (bot, message) => {
        let response = generateCommandList(ADMIN_PREFIX, bot.adminCommands, message.member);
        message.channel.send(response);
    }
};
