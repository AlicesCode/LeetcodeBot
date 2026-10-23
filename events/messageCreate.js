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
        }
        if (config.settings.echoChannels[message.channelId]) {
            await message.reply(message.content != '' ? message.content : "empty message");
        }
    }
}