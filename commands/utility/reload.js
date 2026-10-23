const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder().setName('reload').setDescription('Reloads a commnad').addStringOption(option => option.setName('command').setDescription('The command to reload').setRequired(true)),
    async execute(interaction) {
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);
        if (!command) {
            return interaction.reply(`There is no command with name \`${commandName}\`!`);
        }
        const path = `./${command.data.name}.js`
        delete require.cache[require.resolve(path)];
        try {
            const newCommand = require(path)
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`Command \`${path}\` was reloaded!`)
            await config.log({
                user: interaction.user,
                action: `reloaded \`${path}\`.`})
        } catch (error) {
            console.error(error);
            await interaction.reply(`There was an error while reloading a command \`${path}\`:\n\`${error.message}\``);
        }
    },
};