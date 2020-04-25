const DEFAULTPREFIX = '/';
const ADMINPREFIX = '!';

/*
 * Parses through a message with the default command prefix
 * @message: message object
 * @params: list of strings split up by spaces
 */
async function handleCommand(commands, bot, message, params) {
	params[0] = params[0].substr(1);//drop prefix
	if (params[0] in commands) {
		const command = commands[params[0]];
		//if the user has the permissions to execute the command
		if (isPermitted(message.member, command.permittedRoles)) {
			const commandParams = {
				args: params,
				parameters: command.parameters
			};
			await command.execute(bot, message, commandParams);
		}
	}
}

/*
 * checks if a user has at least one of the set of roles
 */
function isPermitted(member, roles) {
    if (roles.length === -0)
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
    return member.roles.has(getRoleId(member, role));
}

/*
 * gets the id of a role
 * @member: guild member object
 * @role: role string name
 * returns id
 */
function getRoleId(member, name) {
    const role = member.guild.roles.find(x => x.name === name);
    if (role)
        return role.id;
    else
        return null;
}


module.exports = {
    DEFAULTPREFIX,
    ADMINPREFIX,
    isPermitted,
    getRoleId,
    hasRole,
	handleCommand
};
