const {DEFAULT_PREFIX} = require("../utils");
module.exports = {
    name: 'setrsn',
    description: 'sets your own rsn for the rank list',
    parameters: ["rsn"],
    help: 'Example of usage: `' + DEFAULT_PREFIX + 'setrsn Shadowstream`',
    permittedRoles: ["ranks"],
    execute: async function (bot, message, params) {
        if (typeof (params.args[1]) === 'undefined') {
            await message.channel.send(module.exports.help);
            return;
        }
        const rsn = params.args.slice(1).join(" ");

        if (await bot.database.setRsn(message.member.id, rsn, message.member.displayName)) {
            message.channel.send(`I have set your rsn to ${rsn}`).catch(() => {
                console.error("unable to send message to respond to setrsn");
            });
        }
    }
};