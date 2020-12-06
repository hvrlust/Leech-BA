const {hasRole, DEFAULT_PREFIX} = require("../utils");
module.exports = {
    name: 'add',
    description: 'adds customer and q role to a mentioned user',
    parameters: ["@user"],
    help: 'example use: `' + DEFAULT_PREFIX + 'add @Queuebot#2414`',
    permittedRoles: ["ranks"],
    execute: (bot, message) => {
        const leeches = message.mentions.users;
        const rolesList = message.channel.guild.roles.cache;
        if (leeches.size === 0) {
            message.channel.send(module.exports.help).then(() => {});
            return;
        }
        leeches.forEach(function (leech) {
            const rolesToAdd = [];
            const member = message.guild.member(leech);
            if (!hasRole(member, "Q"))
                rolesToAdd.push(rolesList.find(x => x.name === 'Q').id); //if they don't have the roles already

            if (!hasRole(member, "customers"))
                rolesToAdd.push(rolesList.find(x => x.name === 'customers').id);

            if (rolesToAdd.length === 0) {
                message.channel.send(`${member} already has the roles`).then(() => {
                });
                return;
            }

            member.roles.add(rolesToAdd, "Added relevant customer roles").then(async () => {
                await message.channel.send(`Added roles to ${member}`);
            }, async (error) => {
                await message.channel.send("Error adding customer role.  Error: " + error.message);
            });

        });
    },
};