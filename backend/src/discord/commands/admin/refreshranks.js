const {hasRole} = require("../utils");

module.exports = {
    name: 'refreshranks',
    description: 'refresh rank list for website',
    parameters: [],
    help: 'self explanatory',
    permittedRoles: ["stuff", "Server admin"],
    execute: async function (bot, message) {
        await message.reply("refreshing rank list...").then(async (response) => {
            await Promise.all(message.guild.members.cache.map(async member => {
                if (hasRole(member, "ranks")) {
                    await bot.database.grantRank(member.id);
                } else {
                    await bot.database.revokeRank(member.id);
                }
            }));
            bot.database.getRankDiscordTags().then(async rows => {
                for (const row of rows) {
                    if(message.guild.members.cache.filter(member => member.id === row['discord_tag']).size === 0) {
                        bot.database.revokeRank(row['discord_tag']).catch(e => console.error(e));
                    }
                }

                bot.database.getRanksWithNoRsnSet().then(async rows => {
                    await response.edit(rows.length === 0 ? `${message.member}, **nice**! All active ranks have a set RSN!` :
                        `${message.member}, the following have no RSN set ${rows
                            .map(row => row['discord_tag'])
                            .filter(row =>  row !== undefined && row.length > 10)
                            .map(row =>  `\n - <@${row}>`)
                            .join(" ")}`)
                        .catch(() => console.error('unable to edit message'));
                });
            });
        });
    }
};