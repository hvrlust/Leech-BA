const {console} = require('../utils');

const commandUtils = require('./common/command-utils');
const {hasRole} = require("./common/command-utils");
const {isPermitted} = require("./common/command-utils");
const DEFAULTPREFIX = commandUtils.DEFAULTPREFIX;
const ADMINPREFIX = commandUtils.ADMINPREFIX;
let currentQueueChannel = "queue";

/*
 * list of commands, descriptions and functions
 * keep manually sorted alphabetically
 */

const commands = {
    'add': {
        description: 'adds customer and q role to a mentioned user',
        parameters: ["user tag"],
        require: [],
        help: 'example use: `' + DEFAULTPREFIX + 'add @Queuebot#2414`',
        permittedRoles: ["ranks"],
        execute: function (bot, message) {
            const leeches = message.mentions.users;
            const rolesList = message.channel.guild.roles;
            if (leeches.size === 0) {
                message.channel.send(this.help);
                return;
            }
            leeches.forEach(function (leech) {
                const rolesToAdd = [];
                message.guild.fetchMember(leech).then(member => {
                    //if leech has a permitted role (is a rank), stop this action
                    if (isPermitted(member, commands['add'].permittedRoles)) {
                        message.channel.send("You are not permitted to give this user these roles.");
                        return;
                    }

                    if (!hasRole(member, "Q"))
                        rolesToAdd.push(rolesList.find(x => x.name === 'Q').id); //if they don't have the roles already

                    if (!hasRole(member, "customers"))
                        rolesToAdd.push(rolesList.find(x => x.name === 'customers').id);

                    if (rolesToAdd.length === 0) {
                        message.channel.send(member + " already has the roles");
                        return;
                    }

                    member.addRoles(rolesToAdd, "Added relevant customer roles").then(function () {
                        message.channel.send("Added roles to " + member);
                    }, function (error) {
                        message.channel.send("Error adding customer role.  Error: " + error.message);
                    });
                }).catch(error => {
                    console.log(error);
                });
            });
        }
    },
    'complete': {
        description: 'removes q role from a user',
        parameters: ["user tag"],
        help: 'example use: `' + DEFAULTPREFIX + 'complete @Queuebot#1337`',
        permittedRoles: ["ranks"],
        execute: function (bot, message) {
            const leeches = message.mentions.users;
            if (leeches.size === 0) {
                message.channel.send(this.help);
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
    },
    'commands': {
        description: 'displays this list of commands the person called me can use',
        parameters: [],
        permittedRoles: [],
        execute: function (bot, message) {
            let response = "```asciidoc\nAvailable Commands \n====================";
            for (let command in commands) {
                if (commands.hasOwnProperty(command)) { //sanity check
                    /* check permissions */
                    const permitted = isPermitted(message.member, commands[command].permittedRoles);
                    if (!permitted) continue;

                    /* appends command to command list */
                    response += '\n' + DEFAULTPREFIX + command;
                    for (let i = 0; i < commands[command].parameters.length; i++) {
                        response += ' <' + commands[command].parameters[i] + '>';
                    }
                }
                response += " :: " + commands[command].description;
            }
            response += "```";
            message.channel.send(response);
        }
    },
    'confirm': {
        description: "acknowledge you have added the leech to the queue",
        parameters: [],
        help: "Use this in the queue channel to remove the pin",
        permittedRoles: ["ranks"],
        execute: function (bot, message) {
            if (message.channel.name !== currentQueueChannel) {
                console.log(message.author.username + " attempted to use the confirm command in the wrong channel.");
                return;
            }
            const args = message.content.split(' ');

            message.channel.fetchPinnedMessages().then(messages => {
                if (messages.size > 0) {
                    if (!args[1]) {
                        message.channel.send('Please enter the rsn of the person you are confirming or use the word "-all.');
                    } else if (args[1] === '-all') {
                        messages.forEach(function (m) {
                            if (m.author.bot) {
                                m.unpin().catch(error => {
                                    console.log('error from fetching pinned messages in confirm all' + error);
                                });
                            }
                        });
                        message.channel.send('Confirmed.  Remember to confirm with the customer in FC/CC.');
                    } else {
                        const userRequests = messages.filter(m => m.content.toLowerCase().includes(args[1].toLowerCase()));

                        if (userRequests.size === 0) {
                            message.channel.send('No request exists.');
                            message.delete();
                        } else {
                            userRequests.forEach(function (m) {
                                m.unpin().catch(error => {
                                    console.log('error from fetching pinned messages in confirm all' + error);
                                });
                            });
                            message.channel.send('Confirmed. Remember to confirm with the customer in FC/CC.')
                        }
                    }
                } else {
                    message.channel.send('There are no entries to confirm.')
                }
            }).catch(console.error)
        }
    },
    'eta': {
        description: 'copypasta for eta information',
        parameters: [],
        require: [],
        permittedRoles: ["ranks"],
        execute: async function (bot, message) {
            message.delete().then(() => {
                message.channel.send('We can\'t estimate wait times. It depends on when there are enough ranks and ' +
                    'leeches available to form a team, and we can\'t predict either variable.\n' +
                    'We don\'t schedule leeches');
            });
        }
    },
    'login': {
        description: 'generates a login link',
        parameters: [],
        require: [],
        help: 'example use: add @Queuebot#2414`',
        permittedRoles: ["ranks", "Bots", "developer", "Jia", "stuff"],
        execute: async function (bot, message) {
            const code = await bot.database.generateCode(message.author.id, message.author.username);
            message.author.send('Your generated login code is here: \n https://leechba.site/login/' + code + ' \n This will expire in 5 minutes.')
                .then(() => message.reply('check your pm!'))
                .catch(() => message.reply('oops, couldn\'t pm you, can you check your server privacy settings?'));
        }
    },
    'nm': {
        description: 'copypasta for normal mode information',
        parameters: [],
        permittedRoles: ["ranks"],
        execute: function (bot, message) {
            message.delete().then(msg => {
                msg.channel.send("Normal Mode is 12m if you want to be paired with another leech, or 24m if " +
                    "you leech solo. The solo leech may get it done sooner since we'd only need you+ranks available " +
                    "rather than you+ranks+another leech.");
            });
        }
    },
    'ok': {
        description: 'replies with a standard leech response',
        parameters: [],
        permittedRoles: ["ranks"],
        execute: function (bot, message) {
            message.delete().then(msg => {
                msg.channel.send('Ok, we work with a queue system, I\'ll add you to it. If you can, guest in the ' +
                    'CC (Leech BA) when free - we prioritize leeches there over leeches on disc. We will call you by name ' +
                    'if we have a team you can join. Please respond even if you\'re not free, it helps us and other leeches. ')
            });
        }
    },
    'queue': {
        description: 'replies with queue url',
        parameters: [],
        permittedRoles: ["ranks"],
        execute: function (bot, message) {
            message.channel.send('Queue available here: <https://leechba.site/queue>');
        }
    },
    'setrsn': {
        description: 'sets your own rsn for the rank list',
        parameters: ["rsn"],
        help: 'Example of usage: `' + DEFAULTPREFIX + 'setrsn Shadowstream`',
        permittedRoles: ["ranks"],
        execute: async function (bot, message, params) {
            if (typeof (params.args[1]) === 'undefined') {
                message.channel.send(this.help);
                return;
            }
            const rsn = params.args.slice(1).join(" ");

            if (await bot.database.setRsn(message.member.id, rsn, message.member.displayName)) {
                message.channel.send(`I have set your rsn to ${rsn}`).catch(() => {
                    console.error("unable to send message to respond to setrsn");
                });
            }
        }
    },
    'site': {
        description: 'copypasta for customer information',
        parameters: [],
        permittedRoles: ["ranks"],
        execute: function (bot, message) {
            message.delete().then(() => {
                message.channel.send('You can view prices and info, as well as request a leech, at https://leechba.site/calculator');
            });
        }
    },
    'trial': {
        description: 'shows trial information and posts',
        parameters: [],
        permittedRoles: [],
        execute: function (bot, message) {
            message.channel.send('\nFor trial information, please read the information in <#527662247892484116>, ' +
                '<#527679260010479621>, <#527679195816656896>, and <#531173841553195018>.\n\nIf you want to apply then ' +
                'please ask in <#531835331448930304>.');
        }
    },
    'timezone': {
        description: 'allows you to add/change your timezone role',
        parameters: ["USA AUS or EU"],
        help: 'timezones to choose from: USA, AUS, and EU. \n Example of usage: `' + DEFAULTPREFIX + 'timezone EU`',
        permittedRoles: [],
        execute: function (bot, message, params) {
            if (typeof (params.args[1]) === 'undefined') {
                message.channel.send(this.help);
                return;
            }
            const user = message.member;
            const timezone = params.args[1].toUpperCase();
            switch (timezone) {
                case 'EU':
                case 'USA':
                case 'AUS':
                    removeTimezone(user,
                        function () {
                            user.addRole(message.channel.guild.roles.find("name", timezone).id, "added " + timezone)
                                .then(() => message.channel.send("Timezone successfully changed to " + timezone))
                                .catch(console.error);
                        });
                    break;
                default:
                    message.channel.send(this.help);
            }
        }
    }
};

const adminCommands = {
    'addrank': {
        description: 'grant rank access for the site to the specified discord user',
        parameters: [],
        require: [],
        help: 'example use: /addrank @Queuebot#2414`',
        permittedRoles: ["stuff", "Server admin"],
        execute: async function (message, params, db) {
            const user = message.mentions.users.first();
            if (user) {
                const success = await db.grantRank(user.id);

                if (success) {
                    await message.reply('successfully granted rank');
                } else {
                    await message.reply('user already has or some other bs');
                }
            }
        }
    },
    'revokerank': {
        description: 'remove rank access for the site to the specified discord user',
        parameters: [],
        require: [],
        help: 'example use: /revokerank @Queuebot#2414`',
        permittedRoles: ["stuff", "Server admin"],
        execute: async function (message, params, db) {
            const user = message.mentions.users.first();
            if (user) {
                const success = await db.revokeRank(user.id);
                if (success) {
                    await message.reply('successfully removed rank');
                } else {
                    await message.reply(`user doesn't have rank`);
                }
            }
        }
    },
    'clearchat': {
        description: 'clears chat of last 50 messages',
        parameters: [],
        permittedRoles: ["stuff", "Server admin"],
        execute: function (bot, message) {
            message.channel.fetchMessages().then(messages => message.channel.bulkDelete(messages)).catch(console.error);
        }
    },
    'commands': {
        description: 'Displays list of commands for admins',
        parameters: [],
        permittedRoles: ["stuff", "Server admin", "developer"],
        execute: function (bot, message) {
            let response = "```asciidoc\nAvailable Commands \n====================";
            for (const command in adminCommands) {
                if (adminCommands.hasOwnProperty(command)) { //sanity check
                    /* check permissions */
                    const permitted = isPermitted(message.member, adminCommands[command].permittedRoles);
                    if (!permitted) continue;

                    /* appends command to command list */
                    response += '\n' + ADMINPREFIX + command;
                    for (let i = 0; i < adminCommands[command].parameters.length; i++) {
                        response += ' <' + adminCommands[command].parameters[i] + '>';
                    }
                }
                response += " :: " + adminCommands[command].description;
            }
            response += "```";
            message.channel.send(response);
        }
    },
    'docs': {
        description: 'Sends Discord.js document link',
        parameters: [],
        permittedRoles: ["Server admin"],
        execute: function (bot, message) {
            message.channel.send('<https://discord.js.org/#/docs/main/stable/general/welcome>');
        }
    },
    'pin': {
        description: 'Pins message in the channel after the command',
        parameters: [],
        permittedRoles: ["stuff", "Server admin"],
        execute: function (bot, message, params) {
            params.args.splice(0, 1);
            var pinnedMessage = params.args.join(" ");
            message.channel.send(pinnedMessage).then(m => m.pin()).catch(function () {
                message.channel.send("error pinning message");
                console.error;
            });
        }
    },
    'poll': {
        description: 'posts and pins a message, adding :thumbsup: :thumbsdown: :shrug: for voting',
        parameters: [],
        permittedRoles: ["stuff", "Server admin"],
        execute: function (bot, message, params) {
            message.channel.send(params.args.slice(1).join(' ')).then(async function (message) {
                await message.react("👍");
                await message.react("👎");
                await message.react("🤷");
                await message.pin();
            });
        }
    },
    'info': {
        description: 'loads the embedded information message',
        parameters: [],
        permittedRoles: ["Server admin"],
        execute: async function (bot, message) {
            await message.channel.send({
                    embed: {
                        color: 2263842,
                        author: {
                            name: "Welcome to the RS3 Leech Ba Discord Server",
                            icon_url: message.guild.iconURL
                        },
                        fields: [{
                            name: "Customer Information",
                            value: "**1.** Please read the following asking any questions. Any further questions should be asked in <#361546164530708480>. \n\n" +
                                "**2.** Please change your nickname to your current RSN + make sure your Discord status is not set to offline. \n\n" +
                                "**3.** You are encouraged to **guest** in the CC **'Leech BA'**. Let us know if you are not planning to do this.\n\n" +
                                "**4.** Prices and a calculator can be found [here](https://leechba.site/calculator). Please use \"request this leech\".\n\n" +
                                "**5.** After sending a queue request, ask in <#361546164530708480> or the CC for the **@customers** role. You may use the \"/timezone\" command to add your timezone. Read everything above the [FAQ](https://leechba.site/info).\n\n" +
                                "**6.** The leeching process: \n" +
                                "**>** When a team forms, the CC then Discord will be checked for any leech not offline\n" +
                                "**>** If you're up next, you will be tagged in <#361546164530708480>\n" +
                                "**>** Customers in CC will have priority over those not in CC at the time the team is being formed."
                        },
                            {
                                name: '\u200b',
                                value: '\u200b',
                            },
                            {
                                name: "Links",
                                value: "" +
                                    "**-** Discord Invite:    [rs3discord.leechba.site](http://rs3discord.leechba.site) or [discord.gg/j4DgZBj](https://discord.gg/j4DgZBj)\n" +
                                    "**-** Website:    [leechba.site](https://leechba.site)\n" +
                                    "**-** Prices & Calculator:    [rs3.leechba.site](https://leechba.site/calculator)\n" +
                                    "**-** Information & FAQ:    [info.leechba.site](https://leechba.site/info)\n" +
                                    "**-** Leeching King Guide:    [https://leechba.site/howtoleech](https://leechba.site/howtoleech)\n" +
                                    "**-** RSOF & Reviews:    [QFC 194-195-569-64782885](http://services.runescape.com/m=forum/forums.ws?194,195,569,64782885)\n\n"
                            }
                        ],
                        footer: {
                            icon_url: message.guild.iconURL,
                            text: "Thank you for using Leech BA"
                        }
                    }
                }
            );
            message.delete().catch(() => {
                console.log('Error deleting message using !info');
            });
            message.channel.send('https://discord.gg/j4DgZBj');
        }
    },
    'queue': {
        description: 'allows modifications to where the default queue channel',
        parameters: ['-default', '-get', '-set'],
        help: '',
        permittedRoles: ["Server admin", "developer"],
        execute: async function (bot, message, params) {
            const args = message.content.split(' ');
            if (args[1] === params.parameters[0]) {
                currentQueueChannel = "queue";
                message.channel.send("Queue channel set to #" + currentQueueChannel);
            } else if (args[1] === params.parameters[1]) {
                message.channel.send("Queue channel currently set to #" + currentQueueChannel);
                return;
            } else if (args[1] === params.parameters[2]) {
                let channelName = message.channel.name;
                if (typeof (args[2]) != "undefined") {
                    channelName = args[2];
                }
                let channel = message.client.channels.find(channel => channel.name === channelName);
                if (channel) {
                    currentQueueChannel = channel.name;
                    message.channel.send("Queue channel set to " + channel);
                } else {
                    message.channel.send("Error: channel #" + args[2] + " does not exist");
                }
            } else {
                message.channel.send(this.description +
                    "\n Parameters available: <-default> <-get> <-set>"
                );
                return;
            }
            bot.setQueueChannel(message.client.channels.find(channel => channel.name === currentQueueChannel));

        }
    },
    'refreshranks': {
        description: 'refresh rank list for website',
        parameters: [],
        permittedRoles: ["stuff", "Server admin"],
        execute: async function (bot, message) {
            await message.reply("refreshing rank list...").then(async (response) => {
                await Promise.all(message.guild.members.map(async member => {
                    if (hasRole(member, "ranks")) {
                        await bot.database.grantRank(member.id);
                    } else {
                        await bot.database.revokeRank(member.id);
                    }
                }));
                bot.database.getRankDiscordTags().then(async rows => {
                    for (const row of rows) {
                        if(message.guild.members.filter(member => member.id === row['discord_tag']).size === 0) {
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
    },
    'setrsn': {
        description: 'sets somebody else\'s rsn for the rank list',
        parameters: ["user", "rsn"],
        help: 'Example of usage: `' + ADMINPREFIX + 'setrsn @<user> Shadowstream`',
        permittedRoles: ["stuff", "Server admin"],
        execute: async function (bot, message, params) {
            if (typeof (params.args[1]) === 'undefined' || typeof (params.args[2]) === 'undefined' ||
                message.mentions.users.size === 0) {
                message.channel.send("Insufficient parameters! \n" + this.help);
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
    }
};

/*
 * removes all timezones from a user
 * @user: guild member object
 * @callback: a function that gets executed upon completion
 */
function removeTimezone(user, callback) {
    const timezones = ["EU", "USA", "AUS"];
    const roles = [];
    timezones.forEach(function (timezone) {
        if (user.roles.find('name', timezone)) {
            roles.push(user.guild.roles.find("name", timezone).id)
        }
    });
    if (roles.length > 0) {
        //async function complete then callback
        user.removeRoles(roles, "requested in changing timezones").then(function () {
            callback(); //TODO account for no callback param
        }).catch(console.error);
    } else {
        callback();
    }
}

/*
 *
 *
*/

module.exports = {
    commands,
    adminCommands
};
