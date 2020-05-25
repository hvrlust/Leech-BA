const {DEFAULT_PREFIX} = require("../utils");
/*
 * removes all timezones from a user
 * @user: guild member object
 * @callback: a function that gets executed upon completion
 */
function removeTimezone(user, callback) {
    const timezones = ["EU", "USA", "AUS"];
    const roles = [];
    timezones.forEach(function (timezone) {
        const role = user.roles.find(x => x.name === timezone);
        if (role) {
            roles.push(role);
        }
    });
    if (roles.length > 0) {
        //async function complete then callback
        user.removeRoles(roles, "requested in changing timezones").then(function () {
            callback();
        }).catch(console.error);
    } else {
        callback();
    }
}

module.exports = {
    name: 'timezone',
    description: 'allows you to add/change your timezone role',
    parameters: ["USA AUS or EU"],
    help: 'timezones to choose from: USA, AUS, and EU. \n Example of usage: `' + DEFAULT_PREFIX + 'timezone EU`',
    permittedRoles: [],
    execute: (bot, message, params) => {
        if (typeof (params.args[1]) === 'undefined') {
            message.channel.send(module.exports.help);
            return;
        }
        const user = message.member;
        const timezone = params.args[1].toUpperCase();
        switch (timezone) {
            case 'EU':
            case 'USA':
            case 'AUS':
                removeTimezone(user,
                    () => {
                        const role = message.channel.guild.roles.find(x => x.name === timezone);
                        user.addRole(role.id, "added " + timezone)
                            .then(() => message.channel.send("Timezone successfully changed to " + timezone))
                            .catch(console.error);
                    });
                break;
            default:
                message.channel.send(this.help);
        }
    }
};