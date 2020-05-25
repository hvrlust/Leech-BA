module.exports = {
    name: 'queue',
    description: 'modify the channel where queue requests are sent to',
    parameters: ['-default', '-get', '-set'],
    help: '```TODO```',
    permittedRoles: ["Server admin", "developer"],
    execute: async function (bot, message, params) {
        const args = message.content.split(' ');
        let queue = await bot.getQueueChannel();
        if (args[1] === params.parameters[0]) {
            queue = "queue";
            let channel = message.guild.channels.find(channel => channel.name === queue);
            message.channel.send("Queue channel set to " + channel);
        } else if (args[1] === params.parameters[1]) {
            message.channel.send("Queue channel currently set to " + queue);
            return;
        } else if (args[1] === params.parameters[2]) {
            let channelName = message.channel.name;
            if (typeof (args[2]) != "undefined") {
                channelName = args[2];
            }
            let channel = message.guild.channels.find(channel => channel.name === channelName);
            if (channel) {
                queue = channel.name;
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
        bot.setQueueChannel(message.guild.channels.find(channel => channel.name === queue));

    }
};