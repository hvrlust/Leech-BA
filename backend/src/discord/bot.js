// debugging
const console = (function () {
	var timestamp = function () { };
	timestamp.toString = function () {
		return "[" + (new Date).toLocaleTimeString() + "]";
	};
	return {
		log: this.console.log.bind(this.console, '%s', timestamp)
	}
})();

const Discord = require('discord.js');

const bot = new Discord.Client();

var last = 0;
const commandList = require('./command-list.js');
const commandUtils = require('./common/command-utils.js');
const site = require('./site-api/main.js');

/*
 * Parses through a message with the default command prefix
 * @message: message object
 * @params: list of strings split up by spaces
 */
function handleCommand(message, params) {
	params[0] = params[0].substr(1);//drop prefix
	if (params[0] in commandList.commands) {
		var command = commandList.commands[params[0]];
		//if the user has the permissions to execute the command
		if (commandUtils.isPermitted(message.member, command.permittedRoles)) {
			var commandParams = {
				args: params,
				parameters: command.parameters
			};
			command.execute(message, commandParams);
		}
	}
}

/*
 * see handleCommand
 */
function handleAdminCommand(message, params) {
	params[0] = params[0].substr(1);//drop prefix
	if (params[0] in commandList.adminCommands) {
		var command = commandList.adminCommands[params[0]];
		if (commandUtils.isPermitted(message.member, command.permittedRoles)) {
			var commandParams = {
				args: params,
				parameters: command.parameters
			};
			command.execute(message, commandParams);
		}
	}
}

/*
 *
 */
function handleQueueChannelSupport(message) {

}

exports.run = function (token, database, guildId) {
	let resolve, reject;
	let p = new Promise(function(res, rej) {
		resolve = res;
		reject = rej;
	});
	bot.on('ready', () => {
		console.log('bot ready');
		resolve({
			adminChannel: bot.channels.find(channel => channel.name === "test"),
			queueChannel: bot.channels.find(channel => channel.name === "queue"),
		});
	});

	bot.on('disconnect', function (erMsg, code) {
		console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
	});

	bot.on('error', function (message) {
		console.log(new Date().toString() + 'error recieved', message);
	});

	bot.on('message', message => {
		var args = message.content.split(" ");
		/* commands */
		if (args[0].startsWith(commandUtils.DEFAULTPREFIX)) {
			handleCommand(message, args);
		}
		/* admin/mod commands */
		if (args[0].startsWith(commandUtils.ADMINPREFIX)) {
			handleAdminCommand(message, args);
		}

		/* AI responses */
        const channel = bot.channels.find(channel => channel.name === "bot-test");
		if (message.channel.id === channel.id) {

		}

		/* moderation commands */
		//TODO
	});

	//load other modules
    site.run(bot, database, guildId);
	
	// log our bot in
	return bot.login(token).then(() => p);
};
