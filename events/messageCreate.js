const { Events } = require("discord.js");
const config = require("../config");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.id === config.app.clientId) {
            return;
        }
        if (config.isSubmission(message)) {
            await config.volatile.guilds[message.guildId].discussionChannel.send(message.url)
            config.streaks.guilds[message.guildId][message.author.id].hasSubmitted = true;
            console.log(config.streaks.guilds['1558654694891589724'])
        }
        if (config.settings.echoChannels[message.channelId]) {
            await message.reply(message.content != '' ? message.content : "empty message");
        }
    }
}