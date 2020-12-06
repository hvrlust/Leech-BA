module.exports = {
    name: 'pin',
    description: 'pins message in the channel after the command',
    parameters: [],
    help: 'self explanatory',
    permittedRoles: ["stuff", "Server admin"],
    execute: async (bot, message, params) => {
        params.args.splice(0, 1);
        const pinnedMessage = params.args.join(" ");
        await message.channel.send(pinnedMessage).then(m => m.pin()).catch(function () {
            message.channel.send("error pinning message");
        });
    }
};