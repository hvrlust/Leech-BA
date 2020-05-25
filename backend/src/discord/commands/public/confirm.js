module.exports = {
    name: 'confirm',
    description: "acknowledge you have added the leech to the queue",
    parameters: [],
    help: "Use this in the queue channel to remove the pin",
    permittedRoles: ["ranks"],
    execute: (bot, message) => {
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
};