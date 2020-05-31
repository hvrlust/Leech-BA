const {ADMIN_PREFIX} = require("../utils");

module.exports = {
    name: 'addrank',
    description: 'grant rank access for the site to the specified discord user',
    parameters: ['@user'],
    help: 'example use: `'+ADMIN_PREFIX+'addrank @Queuebot#2414`',
    permittedRoles: ["stuff", "Server admin"],
    execute: async (bot, message) => {
        const user = message.mentions ? message.mentions.users.first() : false;
        if (user) {
            const success = await bot.database.grantRank(user.id);

            if (success) {
                await message.reply('successfully granted rank');
            } else {
                await message.reply('user already has or some other bs');
            }
        } else {
            await message.reply(module.exports.help);
        }
    }
};