module.exports = {
    name: 'login',
    description: 'generates a login link',
    parameters: [],
    require: [],
    help: '/login lets you sign into the Leech BA website by pming you a login link. This will grant you queue access and other restricted content on the site..',
    permittedRoles: ["ranks", "developer", "Jia", "stuff"],
    execute: async (bot, message) => {
        const code = await bot.database.generateCode(message.author.id, message.author.username);
        message.author.send('Your generated login code is here: \n https://leechba.site/login/' + code + ' \n This will expire in 5 minutes.')
            .then(() => message.reply('check your pm!'))
            .catch(() => message.reply('oops, couldn\'t pm you, can you check your server privacy settings?'));
    }
};