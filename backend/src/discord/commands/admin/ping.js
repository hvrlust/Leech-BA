module.exports = {
    name: 'ping',
    description: 'health check',
    parameters: [],
    permittedRoles: ["stuff", "Server admin", "developer"],
    execute(bot, message) {
        message.channel.send('Pong.');
    },
};