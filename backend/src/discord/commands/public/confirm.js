const {console} = require('../../../utils');
module.exports = {
    name: 'confirm',
    description: "acknowledge you have added the leech to the queue",
    parameters: [],
    help: "Use this in the queue channel to remove the pin",
    permittedRoles: ["ranks"],
    execute: async (bot, message) => {
        const args = message.content.split(' ');

        message.channel.messages.fetchPinned().then(async messages => {
            if (messages.size > 0) {
                if (!args[1]) {
                    await message.channel.send('Please enter the rsn of the person you are confirming or use the word "-all.');
                } else if (args[1].length < 3) {
                    await message.channel.send('Please enter at least 3 characters of the rsn, or ask an admin to unpin.');
                } else if (args[1] === '-all') {
                    messages.forEach((m) => {
                        if (m.author.bot) {
                            m.unpin().catch(error => {
                                console.log('error from fetching pinned messages in confirm -all' + error);
                            });
                        }
                    });
                    await message.channel.send('Confirmed.  Remember to confirm with the customer in FC/CC.');
                } else {
                    const userRequests = messages.filter(m => m.content.toLowerCase().includes(args[1].toLowerCase()));

                    if (userRequests.size === 0) {
                        await message.channel.send('No request exists.');
                        await message.delete();
                    } else {
                        var rsns = [];
                        userRequests.forEach(function (m) {
                            var firstLine = m.content.split('\n')[0];
                            var rsn = firstLine.split('RSN: ')[1];
                            rsns.push(rsn);
                            m.unpin().catch(error => {
                                console.log('error from fetching pinned messages in confirm ' + rsn + error);
                                rsns.pop();
                            });
                        });
                        await message.channel.send('Confirmed ' + rsns.join(', ') + '. Remember to confirm with the customer in FC/CC.')
                    }
                }
            } else {
                await message.channel.send('There are no entries to confirm.')
            }
        }).catch(console.error)
    }
};
