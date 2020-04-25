// debugging
const console = (function () {
	const timestamp = function () {
	};
	timestamp.toString = function () {
		return "[" + (new Date).toLocaleTimeString() + "]";
	};
	return {
		log: this.console.log.bind(this.console, '%s', timestamp)
	}
})();

const Discord = require('discord.js');
const bot = new Discord.Client();

const commandList = require('./command-list.js');
const commandUtils = require('./common/command-utils.js');
const {handleCommand} = require("./common/command-utils");


exports.run = function (token, database) {
	let resolve, reject;
	let p = new Promise(function(res, rej) {
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

	this.database = database;

	bot.on('ready', () => {
		console.log('bot ready');
		queueChannel = bot.channels.find(channel => channel.name === "queue");
		resolve();
	});

	bot.on('disconnect', function (erMsg, code) {
		console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
	});

	bot.on('error', function (message) {
		console.log(new Date().toString() + 'error recieved', message);
	});

	bot.on('message', async (message) => {
		const args = message.content.split(" ");
		/* commands */
		if (args[0].startsWith(commandUtils.DEFAULTPREFIX)) {
			await handleCommand(commandList.commands, this, message, args);
		}
		/* admin/mod commands */
		if (args[0].startsWith(commandUtils.ADMINPREFIX)) {
			await handleCommand(commandList.adminCommands, this, message, args);
		}
	});
	
	// log our bot in
	return bot.login(token).then(() => p);
};
