const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls a random number between 1 and your chosen maximum.')
        .addIntegerOption(option =>
            option
                .setName('max')
                .setDescription('The maximum number to roll up to (e.g., 6 for a d6).')
                .setRequired(true)
        ),
    async execute(interaction) {
        const max = interaction.options.getInteger('max');

        // Validate input
        if (max < 1) {
            return interaction.reply('⚠️ Please provide a number greater than 0.');
        }

        const roll = Math.floor(Math.random() * max) + 1;
        await interaction.reply(`🎲 You rolled **${roll}** (1–${max})`);
    },
};