const {hasRole, DEFAULT_PREFIX} = require("../utils");
module.exports = {
    name: 'complete',
    description: 'removes q role from a user',
    parameters: ["user tag"],
    help: 'example use: `' + DEFAULT_PREFIX + 'complete @Queuebot#1337`',
    permittedRoles: ["ranks"],
    execute: (bot, message) => {
        const leeches = message.mentions.users;
        if (leeches.size === 0) {
            message.channel.send(module.exports.help);
            return;
        }
        leeches.forEach(function (leech) {
            //check they have role
            message.guild.fetchMember(leech).then(member => {
                if (!hasRole(member, "Q")) {
                    message.channel.send(member.displayName + " does not have Q role to remove.");
                    return;
                }

                member.removeRole(message.channel.guild.roles.find(x => x.name === 'Q').id, "remove leech")
                    .then(function () {
                        message.channel.send("Removed Q role from " + member);
                    }, function (error) {
                        message.channel.send("Error removing customer role.  Error: " + error.message);
                    });
            }).catch(error => {
                console.log(error);
            });
        });
    },
};