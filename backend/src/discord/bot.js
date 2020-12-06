// debugging
const {console} = require('../utils');

const fs = require('fs');
const Discord = require('discord.js');
const bot = new Discord.Client();

const commandUtils = require('./commands/utils.js');
const {createCustomCommand} = require("./commands/utils");
const {handleCommand} = require("./commands/utils");

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

exports.run = function (token, database) {
    let resolve, reject;
    let p = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    let queueChannel;

    this.setQueueChannel = (q) => {
        queueChannel = q;
    };

    this.getQueueChannel = () => {
        return p.then(() => queueChannel)
    };

    let user; //must be a better way to do this ugly implementation
    this.getUser = () => {
        return p.then(() => user)
    };

    this.loadCommands = async () => {
        this.commands = new Discord.Collection();
        this.adminCommands = new Discord.Collection();

        let commandFiles = fs.readdirSync(process.cwd() + '/src/discord/commands/public').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = requireUncached(process.cwd() + `/src/discord/commands/public/${file}`);
            this.commands.set(command.name, command);
        }
        commandFiles = fs.readdirSync(process.cwd() + '/src/discord/commands/admin').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = requireUncached(process.cwd() + `/src/discord/commands/admin/${file}`);
            this.adminCommands.set(command.name, command);
        }

        const commands = await this.database.loadCommands();
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            this.commands.set(command.command, createCustomCommand(command.command, command.roles, command.response, command.description, command.delete_after));
        }
        //sort alphabetically
        this.commands = this.commands.sort((a, b) => {
            const x = (a.custom ? '1' : '0') + a.name;
            const y = (b.custom ? '1' : '0') + b.name;
            return x.localeCompare(y);
        });
    };

    this.database = database;

    bot.on('ready', () => {
        console.log('bot ready');
        queueChannel = bot.channels.cache.find(channel => channel.name === "queue");
        user = bot.user;
        resolve();
    });

    bot.on('disconnect', (error, code) => {
        console.log('----- Bot disconnected from Discord with code', code, 'for reason:', error, '-----');
    });

    bot.on('error', (e) => {
        console.error('Bot error event', e)
    });

    bot.on('message', async (message) => {
        const args = message.content.split(" ");

        /* commands */
        if (args[0].startsWith(commandUtils.DEFAULT_PREFIX)) {
            await handleCommand(this.commands, this, message, args);
        }
        /* admin/mod commands */
        if (args[0].startsWith(commandUtils.ADMIN_PREFIX)) {
            await handleCommand(this.adminCommands, this, message, args);
        }

    });

    bot.on('guildMemberUpdate', async (oldMember, newMember) => {
        if (oldMember.roles.cache.some((role) => role.name === "ranks") &&
            !newMember.roles.cache.some((role) => role.name === "ranks")) {
            await database.revokeRank(newMember.id);
        }
        if (!oldMember.roles.cache.some((role) => role.name === "ranks") &&
            newMember.roles.cache.some((role) => role.name === "ranks")) {
            await database.grantRank(newMember.id);
        }
    });

    bot.on('guildMemberRemove', async (member) => {
        await database.revokeRank(member.id);
    });

    // log our bot in
    return bot.login(token).then(() => {
        this.loadCommands().then(() => p);
    });
};
