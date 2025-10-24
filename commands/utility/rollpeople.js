const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rollpeople')
        .setDescription('Randomly orders a list of people.')
        .addStringOption(option =>
            option
                .setName('names')
                .setDescription('Enter the names separated by commas or spaces')
                .setRequired(true)
        ),

    async execute(interaction) {
        const namesInput = interaction.options.getString('names');

        // Split by comma or space and filter out empty names
        const names = namesInput.split(/[\s,]+/).map(n => n.trim()).filter(Boolean);

        if (names.length < 2) {
            await interaction.reply('⚠️ Please enter at least 2 names.');
            return;
        }

        // Shuffle using Fisher–Yates algorithm
        for (let i = names.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [names[i], names[j]] = [names[j], names[i]];
        }

        // Format the result
        let result = '🎲 **Roll Order:**\n';
        names.forEach((name, index) => {
            if (index === 0) result += `• 1: ${name}\n`;
            else result += `• ${index + 1}: ${name}\n`;
        });

        await interaction.reply(result);
    }
};