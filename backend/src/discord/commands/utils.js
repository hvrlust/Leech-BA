const {console} = require('../../utils');
const DEFAULT_PREFIX = '/';
const ADMIN_PREFIX = '!';

function createCustomCommand(name, roles, response, description, deleteAfter) {
    return {
        name: name,
        description: description? description : 'copypasta',
        parameters: [],
        permittedRoles: roles? roles.split(',') : [],
        custom: true,
        execute: async (bot, message) => {
            if(deleteAfter) {
                await message.delete();
            }
            await message.channel.send(response);
        }
    }
}

/*
 * Parses through a message with the default command prefix
 * @message: message object
 * @params: list of strings split up by spaces
 */
async function handleCommand(commands, bot, message, params) {
    try {

        params[0] = params[0].substr(1); //drop prefix
        params = params.filter((e) => { return e !== "" }); //remove extra spaces
        if (commands.has(params[0])){
            const command = commands.get(params[0]);
            //if the user has the permissions to execute the command
            if (isPermitted(message.member, command.permittedRoles)) {
                const commandParams = {
                    args: params,
                    parameters: command.parameters
                };
                await command.execute(bot, message, commandParams);
            }
        }
    } catch (e) {
        console.error(e);
    }

}

/*
 * generates the help message given a prefix, command list and the member (to obtain their roles and check whether they can use them)
 * only displays the commands the caller can view
 *
 * rewrite this if you can be bothered
 */
function generateCommandList(prefix, commands, member, all) {
    let response = "```asciidoc\nAvailable Commands \n====================";
    let count = 0;

    for(let i=0; i<commands.size; i++) {
        const command = commands.get(Array.from(commands.keys())[i]);

        /* check permissions */
        if(!isPermitted(member, command.permittedRoles)) continue;

        /* skip if hidden */
        if(!all && command.hidden) continue;

        count++;
        if(i>0 && !commands.get(Array.from(commands.keys())[i-1]).custom && command.custom) {
            //don't bother splitting if too few commands
            if(count >= 7) {
                response += '\n';
            }
        }

        /* appends command to command list */
        response += '\n' + prefix + command.name;
        for(let i = 0; i < command.parameters.length; i++) {
            response += ' <' + command.parameters[i] + '>';
        }
        response += " :: " + command.description;
    }

    response += "```";
    return response;
}

/*
 * checks if a user has at least one of the set of roles
 */
function isPermitted(member, roles) {
    if (roles.length === 0)
        return true;

    for (let i = 0; i < roles.length; i++) {
        if (hasRole(member, roles[i]))
            return true;
    }
    return false;
}

/*
 * a user has a permission role
 * @member: guild member object
 * @role: role as a string (their name)
 * returns boolean
 */
function hasRole(member, role) {
    return member.roles.cache.has(getRoleId(member, role));
}

/*
 * gets the id of a role
 * @member: guild member object
 * @role: role string name
 * returns id
 */
function getRoleId(member, name) {
    const role = member.guild.roles.cache.find(x => x.name === name);
    if (role)
        return role.id;
    else
        return null;
}


module.exports = {
    DEFAULT_PREFIX,
    ADMIN_PREFIX,
    isPermitted,
    getRoleId,
    hasRole,
	handleCommand,
    generateCommandList,
    createCustomCommand
};
