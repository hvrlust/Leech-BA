const {console} = require('../utils');

// DEPRECATED FILE
/*
 * list of commands, descriptions and functions
 * keep manually sorted alphabetically
 */

const commands = {
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
    }
};

const adminCommands = {
    'clearchat': {
        description: 'clears chat of last 50 messages',
        parameters: [],
        permittedRoles: ["stuff", "Server admin"],
        execute: function (bot, message) {
            message.channel.fetchMessages().then(messages => message.channel.bulkDelete(messages)).catch(console.error);
        }
    },
    'docs': {
        description: 'Sends Discord.js document link',
        parameters: [],
        permittedRoles: ["Server admin"],
        execute: function (bot, message) {
            message.channel.send('<https://discord.js.org/#/docs/main/stable/general/welcome>');
        }
    }
};

/*
 *
 *
*/

module.exports = {
    commands,
    adminCommands
};
