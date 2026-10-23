const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Set whether you want to echo or not")
        .addBooleanOption(option => option
            .setName("input")
            .setDescription("Enable echo?")
        ),
    async execute(interaction) {
        const isEnabled = interaction.options.getBoolean("input") ?? !config.settings.echoChannels[interaction.channelId];
        if (isEnabled) {
            config.settings.echoChannels[interaction.channelId] = true;
        } else {
            delete config.settings.echoChannels[interaction.channelId];
        }
        await interaction.reply("Echo now set to " + isEnabled);
        await config.log({
            user: interaction.user,
            action: `${isEnabled ? "enabled": "disabled"} \`echo\``,
            channel: interaction.channel});
        await config.backup();
    }
}