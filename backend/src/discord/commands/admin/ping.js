module.exports = {
    name: 'ping',
    description: 'health check',
    parameters: [],
    help: 'self explanatory',
    hidden: true,
    permittedRoles: ["stuff", "Server admin", "developer"],
    execute(bot, message) {
        message.channel.send('Pong.');
    },
};