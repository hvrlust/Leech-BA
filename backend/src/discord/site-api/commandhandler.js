const commandUtils = require('../common/command-utils');

// debugging
const console = (function () {
  var timestamp = function () {
  };
  timestamp.toString = function () {
    return "[" + (new Date).toLocaleTimeString() + "]";
  };
  return {
    log: this.console.log.bind(this.console, '%s', timestamp)
  }
})();

class CommandHandler {
  constructor(database) {
    this.db = database;
    /*
     * list of commands, descriptions and functions
     * keep manually sorted aplabetically
     */
    this.commandList = {
      'login': {
        description: 'generates a login link',
        parameters: [],
        require: [],
        help: 'example use: add @Queuebot#2414`',
        permittedRoles: ["ranks", "Bots", "developer", "Jia", "stuff"],
        execute: async function (message, params, db) {
          const code = await db.generateCode(message.author.id, message.author.username);
          message.author.send('Your generated login code is here: \n https://leechba.site/login/' + code + ' \n This will expire in 5 minutes.')
            .then(success => message.reply('check your pm!'))
            .catch(error => message.reply('oops, couldn\'t pm you, can you check your server privacy settings?'));
        }
      },
      'jia': {
        description: 'generates a login link',
        parameters: [],
        require: [],
        help: 'example use: add @Queuebot#2414`',
        permittedRoles: ["Jia"],
        execute: async function (message, params, db) {
          const code = await db.generateCode(message.author.id, message.author.username);
          message.reply('http://localhost:8080/login/' + code);
        }
      },
    };

    this.adminCommandList = {
      'addrank': {
        description: 'grant rank access for the site to the specified discord user',
        parameters: [],
        require: [],
        help: 'example use: /addrank @Queuebot#2414`',
        permittedRoles: ["stuff", "Server admin"],
        execute: async function (message, params, db) {
          const users = message.mentions.users;
          await users.forEach(async (user) => {
            const success = await db.grantRank(user.id);

            if (success) {
              message.reply('successfully granted rank');
            } else {
              message.reply('user already has or some other bs');
            }
          });
        }
      },
      'revokerank': {
        description: 'remove rank access for the site to the specified discord user',
        parameters: [],
        require: [],
        help: 'example use: /revokerank @Queuebot#2414`',
        permittedRoles: ["stuff", "Server admin"],
        execute: async function (message, params, db) {
          const users = message.mentions.users;
          await users.forEach(async (user) => {
            const success = await db.revokeRank(user.id);

            if (success) {
              message.reply('successfully removed rank');
            } else {
              message.reply(`user doesn't have rank`);
            }
          });
        }
      }
    };
  }

  /*
 * Parses through a message with the default command prefix
 * @message: message object
 * @params: list of strings split up by spaces
 */
  handleCommand(message, params) {
    params[0] = params[0].substr(1);//drop prefix
    if (params[0] in this.commandList) {
      let command = this.commandList[params[0]];
      //if the user has the permissions to execute the command
      if (commandUtils.isPermitted(message.member, command.permittedRoles)) {
        var commandParams = {
          args: params,
          parameters: command.parameters
        };
        command.execute(message, commandParams, this.db);
      }
    }
  }

  /*
   * see handleCommand
   */
  handleAdminCommand(message, params) {
    params[0] = params[0].substr(1);
    if (params[0] in this.adminCommandList) {
      var command = this.adminCommandList[params[0]];
      if (commandUtils.isPermitted(message.member, command.permittedRoles)) {
        var commandParams = {
          args: params,
          parameters: command.parameters
        };
        command.execute(message, commandParams, this.db);
      }
    }
  }
}

module.exports = CommandHandler;
