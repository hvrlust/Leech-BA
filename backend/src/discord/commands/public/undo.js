const {DEFAULT_PREFIX} = require("../utils");
const {console} = require('../../../utils');

/*
 * deletes sender's message + previous bot message
 * e.g.
 * 1| User 1: hi
 * 2| Bot: hello
 * 3| User 2: what
 * 4| Bot: not sure
 * 5| User 1: /undo
 *
 * lines 4 and 5 will be deleted
 */
module.exports = {
    name: 'undo',
    description: 'deletes the previous bot message that was posted in the channel',
    parameters: [],
    help: 'Example of usage: `' + DEFAULT_PREFIX + 'undo`',
    permittedRoles: ["ranks", "stuff"],
    execute: async function (bot, message) {
        const user = await bot.getUser();
        message.delete().then((msg) => {
            msg.channel.messages.fetch()
                .then(messages => {
                    //disgusting
                    const lastBotMessage = messages
                        .filter(m => m.author.id === user.id)
                        .sort((a, b) =>
                            ((a.createdTimestamp < b.createdTimestamp) ? 1 : ((a.createdTimestamp > b.createdTimestamp) ? -1 : 0)))
                        .first();
                    if(lastBotMessage) {
                        lastBotMessage.delete().then(() => {
                            console.log(`${message.member.displayName} [${message.author.id}] invoked /undo and deleted:\n${lastBotMessage.content}\n`);
                        }).catch(console.error);
                    }
                }).catch(console.error);
        }).catch(console.error);

    }
};