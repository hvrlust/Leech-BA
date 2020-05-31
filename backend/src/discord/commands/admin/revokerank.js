const {ADMIN_PREFIX} = require("../utils");
module.exports = {
    name: 'revokerank',
    description: 'remove rank access for the site to the specified discord user',
    parameters: ['@user'],
    help: 'example use: `'+ADMIN_PREFIX+'revokerank @Queuebot#2414`',
    permittedRoles: ["stuff", "Server admin"],
    execute: async (bot, message) => {
        const user = message.mentions ? message.mentions.users.first() : false;
        if (user) {
            const success = await bot.database.revokeRank(user.id);
            if (success) {
                await message.reply('successfully removed rank');
            } else {
                await message.reply(`user doesn't have rank`);
            }
        } else {
            await message.reply(module.exports.help);
        }
    }
};