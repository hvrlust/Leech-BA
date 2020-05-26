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
    const params = module.exports.parameters.map(param => param.split(' ')[0]);
    if(index === -1) return parsedArgs;
    for(let i=index+1; i<args.length; i++){
        if(params.includes(args[i])){
            return parsedArgs;
        }
        parsedArgs.push(args[i]);
    }
    return parsedArgs;
}

module.exports = {
    name: 'addcommand',
    description: 'add custom copypasta command',
    help: '```asciidoc\nIn no particular order \n' +
        '-name :: the name of the command \n' +
        '-response :: bot\'s response when calling the command \n' +
        '-description [optional] :: what shows up as info when calling /commands \n' +
        '-roles [optional] :: who can call this command \n' +
        '-deleteafter [optional] :: if the caller message is deleted after posting copypasta' +
        '\n\nExample usages: \n'+ADMIN_PREFIX+'addcommand -name time -deleteafter -response the time is currently -description ' +
        'replies with "the time is currently" \n' +
        ''+ADMIN_PREFIX+'addcommand -name ranks -response The ranks are the following... -description responds with copypasta ' +
        '-roles ranks customers```',
    parameters: ["-name name", "-response response", "-role role", "-description description", "-deleteafter"],
    permittedRoles: ["Server admin"],
    execute: async (bot, message, params) => {
        const name = extractArgs("-name", params.args);
        const role = extractArgs("-role", params.args);
        const response = extractArgs("-response", params.args);
        const description = extractArgs("-description", params.args);

        if(name.length !== 1){
            await message.reply("that command requires -name argument followed by the name, use `"+
                ADMIN_PREFIX+"help addcommand` for examples");
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
            await message.reply("that command requires -response argument followed by the copypasta response, use `"+
                ADMIN_PREFIX+"help addcommand` for examples\"");
            return;
        }

        const deleteAfter = params.args.includes("-deleteafter");
        await bot.database.addCommand(name[0], role, response, description, deleteAfter);
        await bot.loadCommands();
        await message.reply(`${name} command added`);
    }
};