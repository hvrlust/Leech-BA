const {ADMIN_PREFIX} = require("../utils");
module.exports = {
    name: 'setrsn',
    description: 'sets somebody else\'s rsn for the rank list',
    parameters: ["@user", "rsn"],
    help: 'Example of usage: `' + ADMIN_PREFIX + 'setrsn @<user> Shadowstream`',
    permittedRoles: ["stuff", "Server admin"],
    execute: async (bot, message, params) => {
        if (typeof (params.args[1]) === 'undefined' || typeof (params.args[2]) === 'undefined' ||
            message.mentions.users.size === 0) {
            await message.channel.send("Insufficient parameters! \n" + module.exports.help);
            return;
        }
        const user = message.mentions.members.first();
        const rsn = params.args.slice(2).join(" ");

        if (await bot.database.setRsn(user.id, rsn, user.displayName)) {
            message.channel.send(`I have set ${user}'s rsn to ${rsn}`).catch(() => {
                console.error("unable to send message to respond to setrsn");
            });
        }
    }
};