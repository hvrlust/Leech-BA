const {console} = require('../../../utils');

module.exports = {
    name: 'info',
    description: 'loads the embedded information message',
    help: '!info',
    parameters: [],
    permittedRoles: ["Server admin"],
    execute: async (bot, message) => {
        await message.channel.send({
            embed: {
                color: 2263842,
                author: {
                    name: "Welcome to the RS3 Leech Ba Discord Server",
                    icon_url: message.guild.iconURL
                },
                fields: [{
                    name: "Customer Information",
                    value: "**1.** Please read the following asking any questions. Any further questions should be " +
                        "asked in <#361546164530708480>. \n\n" +
                        "**2.** Please change your nickname to your current RSN + make sure your Discord status is " +
                        "not set to offline. \n\n" +
                        "**3.** You are encouraged to **guest** in the CC **'Leech BA'**. Let us know if you are " +
                        "not planning to do this.\n\n" +
                        "**4.** Prices and a calculator can be found [here](https://leechba.site/calculator). " +
                        "Please use \"request this leech\".\n\n" +
                        "**5.** After sending a queue request, ask in <#361546164530708480> or the CC for the " +
                        "**@customers** role. You may use the \"/timezone\" command to add your timezone. Read " +
                        "everything above the [FAQ](https://leechba.site/info).\n\n" +
                        "**6.** The leeching process: \n" +
                        "**>** When a team forms, the CC then Discord will be checked for any leech not offline\n" +
                        "**>** If you're up next, you will be tagged in <#361546164530708480>\n" +
                        "**>** Customers in CC will have priority over those not in CC at the time the team is " +
                        "being formed."
                },
                    {
                        name: '\u200b',
                        value: '\u200b',
                    },
                    {
                        name: "Links",
                        value: "" +
                            "**-** Discord Invite:    [rs3discord.leechba.site](http://rs3discord.leechba.site) " +
                            "or [discord.gg/j4DgZBj](https://discord.gg/j4DgZBj)\n" +
                            "**-** Website:    [leechba.site](https://leechba.site)\n" +
                            "**-** Prices & Calculator:    [rs3.leechba.site](https://leechba.site/calculator)\n" +
                            "**-** Information & FAQ:    [info.leechba.site](https://leechba.site/info)\n" +
                            "**-** Leeching King Guide:    [https://leechba.site/howtoleech](https://leechba.site/howtoleech)\n" +
                            "**-** RSOF & Reviews:    " +
                            "[QFC 194-195-569-64782885](http://services.runescape.com/m=forum/forums.ws?194,195,569,64782885)\n\n"
                    }
                ],
                footer: {
                    icon_url: message.guild.iconURL,
                    text: "Thank you for using Leech BA"
                }
            }
        });
        await message.delete().catch((error) => {
            console.log('Error deleting message using !info', error);
        });
        await message.channel.send('https://discord.gg/j4DgZBj');
    }
};