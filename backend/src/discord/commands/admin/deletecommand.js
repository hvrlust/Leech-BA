const {ADMIN_PREFIX} = require("../utils");
module.exports = {
    name: 'deletecommand',
    description: 'removes custom command',
    help: 'example use: `'+ADMIN_PREFIX+'removecommand eta`',
    parameters: ["command"],
    permittedRoles: ["Server admin"],
    execute: async (bot, message, params) => {
        if(params.args.length < 2) {
            await message.reply(module.exports.help);
            return;
        }
        if(await bot.database.removeCommand(params.args[1])) {
            await bot.loadCommands();
            await message.reply(`the ${params.args[1]} command has been deleted`);
        } else {
            await message.reply('that command doesn\'t exist or is locked');
        }
    }
};