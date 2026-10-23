const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("action")
        .setDescription("for testing actions"),
    async execute(interaction) {
        const response = await interaction.reply({
            content: "You asked for some buttons?",
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("revoke").setLabel("Revoke").setStyle(ButtonStyle.Secondary)
                )
            ],
            withResponse: true
        });
        
        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
            if (confirmation.customId === 'confirm') {
                await confirmation.update({ content: "Action confirmed!", components: [] });
            } else {
                await confirmation.update({ content: "Action revoked!", components: [] })
            }
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: 'Action expired, use `/action` to try again', components: [] });
        }
    }
}