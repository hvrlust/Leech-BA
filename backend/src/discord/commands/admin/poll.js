module.exports = {
    name: 'poll',
    description: 'posts and pins a message, adding :thumbsup: :thumbsdown: :shrug: for voting',
    parameters: [],
    help: 'self explanatory',
    permittedRoles: ["stuff", "Server admin"],
    execute: (bot, message, params) => {
        message.channel.send(params.args.slice(1).join(' ')).then(async (msg) => {
            await msg.react("👍");
            await msg.react("👎");
            await msg.react("🤷");
            await msg.pin();
            await message.delete();
        });
    }
};