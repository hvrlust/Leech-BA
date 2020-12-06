module.exports = {
    name: 'ping',
    description: 'health check',
    parameters: [],
    help: 'self explanatory',
    hidden: true,
    permittedRoles: ["stuff", "Server admin", "developer"],
    execute: async (bot, message) => {
        await message.channel.send('Pong.');
    },
};