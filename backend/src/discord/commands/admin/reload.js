module.exports = {
    name: 'reload',
    description: 'reloads the commands',
    parameters: [],
    hidden: true,
    help: 'shouldn\'t ever need to use this',
    permittedRoles: ["Server admin"],
    execute: async (bot, message) => {
        await bot.loadCommands();
        await message.reply("commands reloaded");
    }
};