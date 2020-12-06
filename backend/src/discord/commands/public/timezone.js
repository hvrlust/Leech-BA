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
        const role = user.roles.cache.find(x => x.name === timezone);
        if (role) {
            roles.push(role);
        }
    });
    if (roles.length > 0) {
        //async function complete then callback
        user.roles.remove(roles, "requested in changing timezones").then(function () {
            callback();
        }).catch(console.error);
    } else {
        callback();
    }
}

/*
 * dumb timezone converter
 */

function convertTimezone(timezone) {
    switch(timezone) {
        case 'GMT':
        case 'BST':
        case 'UTC':
        case 'GMT+0':
        case 'GMT+1':
        case 'GMT+2':
        case 'GMT+3':
            return 'EU';
        case 'GMT-5':
        case 'GMT-6':
        case 'GMT-7':
        case 'GMT-8':
        case 'EST':
        case 'MST':
        case 'CST':
        case 'PST':
            return 'USA';
        case 'GMT+5':
        case 'GMT+6':
        case 'GMT+7':
        case 'GMT+8':
            return 'AUS';
        default:
            return timezone;
    }
}

module.exports = {
    name: 'timezone',
    description: 'allows you to add/change your timezone role',
    parameters: ["USA AUS or EU"],
    help: 'timezones to choose from: USA, AUS, and EU. \n Example of usage: `' + DEFAULT_PREFIX + 'timezone EU`',
    permittedRoles: [],
    execute: async (bot, message, params) => {
        if (typeof (params.args[1]) === 'undefined') {
            await message.channel.send(module.exports.help);
            return;
        }
        const user = message.member;
        const timezone = convertTimezone(params.args[1].toUpperCase());
        switch (timezone) {
            case 'EU':
            case 'USA':
            case 'AUS':
                removeTimezone(user,
                    () => {
                        const role = message.channel.guild.roles.cache.find(x => x.name === timezone);
                        user.roles.add(role.id, "added " + timezone)
                            .then(() => message.channel.send("Timezone successfully changed to " + timezone))
                            .catch(console.error);
                    });
                break;
            default:
                await message.channel.send(module.exports.help);
        }
    }
};