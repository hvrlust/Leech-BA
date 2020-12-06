const {hasRole, DEFAULT_PREFIX} = require("../utils");
module.exports = {
    name: 'complete',
    description: 'removes q role from a user',
    parameters: ["@user"],
    help: 'example use: `' + DEFAULT_PREFIX + 'complete @Queuebot#1337`',
    permittedRoles: ["ranks"],
    execute: async (bot, message) => {
        const leeches = message.mentions.users;
        if (leeches.size === 0) {
            await message.channel.send(module.exports.help);
            return;
        }
        leeches.forEach(leech => {
            //check they have role
            const member = message.guild.member(leech);
            if (!hasRole(member, "Q")) {
                message.channel.send(member.displayName + " does not have Q role to remove.");
                return;
            }

            member.roles.remove(message.channel.guild.roles.cache.find(x => x.name === 'Q').id, "remove leech")
                .then(() => {
                    message.channel.send(`Removed Q role from ${member}`);
                }, (error) => {
                    message.channel.send("Error removing customer role.  Error: " + error.message);
                });
        });
    },
};