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

const DEFAULTPREFIX = '/';
const ADMINPREFIX = '!';

/*
 * checks if a user has at least one of the set of roles
 */
function isPermitted(member, roles) {
	if (roles.length == 0)
		return true;

	for (var i = 0; i < roles.length; i++) {
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
function getRoleId(member, role) {
	var role = member.guild.roles.find(roles => roles.name === role);
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
	hasRole, //maybe don't need this
};
