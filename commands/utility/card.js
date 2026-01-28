const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('card')
        .setDescription('Draws a random card from a standard 52-card deck.'),
    async execute(interaction) {

        const suits = ['♠ Spades', '♥ Hearts', '♦ Diamonds', '♣ Clubs'];
        const ranks = [
            'Ace', '2', '3', '4', '5', '6', '7',
            '8', '9', '10', 'Jack', 'Queen', 'King'
        ];

        // Pick random suit and rank
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const rank = ranks[Math.floor(Math.random() * ranks.length)];

        const cardName = `${rank} of ${suit}`;

        await interaction.reply(`🃏 You drew: **${cardName}**`);
    },
};