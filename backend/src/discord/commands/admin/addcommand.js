const {getRoleId} = require("../utils");
const {ADMIN_PREFIX} = require("../utils");

function commandAlreadyExists(command, commands) {
    return commands.has(command);
}

function areRealRoles(member, roles) {
    const t = roles.filter(role => getRoleId(member, role) !== null);
    return t.length > 0;
}

function extractArgs(word, args) {
    const parsedArgs = [];
    const index = args.indexOf(word);
    if(index === -1) return parsedArgs;
    for(let i=index+1; i<args.length; i++){
        if(module.exports.parameters.includes(args[i])){
            return parsedArgs;
        }
        parsedArgs.push(args[i]);
    }
    return parsedArgs;
}

module.exports = {
    name: 'addcommand',
    description: 'add custom copypasta command',
    parameters: ["-name", "-role", "-response", "-description", "-deleteafter"],
    help: 'example use: `'+ADMIN_PREFIX+'addrank @Queuebot#2414`',
    permittedRoles: ["Server admin"],
    execute: async (bot, message, params) => {
        const name = extractArgs("-name", params.args);
        const role = extractArgs("-role", params.args);
        const response = extractArgs("-response", params.args);
        const description = extractArgs("-description", params.args);

        if(name.length !== 1){
            await message.reply("that command requires -name argument followed by the name");
            return;
        }

        if(commandAlreadyExists(name[0], bot.commands)) {
            await message.reply("command name already in use");
            return;
        }

        if(role.length > 0 && !areRealRoles(message.member, role)){
            await message.reply("some roles don\'t exist!");
            return;
        }

        if(response.length < 1){
            await message.reply("that command requires -response argument followed by the copypasta response");
            return;
        }

        const deleteAfter = params.args.includes("-deleteafter");
        await bot.database.addCommand(name[0], role, response, description, deleteAfter);
        await bot.loadCommands();
        await message.reply(`${name} command added`);
    }
};