const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('smallcard')
        .setDescription('Draws a random card from a standard 52-card deck.'),
    async execute(interaction) {

        const suits = [
            { name: 'Spades', symbol: '♠', code: 'S' },
            { name: 'Hearts', symbol: '♥', code: 'H' },
            { name: 'Diamonds', symbol: '♦', code: 'D' },
            { name: 'Clubs', symbol: '♣', code: 'C' }
        ];

        const ranks = [
            { name: 'Ace', code: 'A' },
            { name: '2', code: '2' },
            { name: '3', code: '3' },
            { name: '4', code: '4' },
            { name: '5', code: '5' },
            { name: '6', code: '6' },
            { name: '7', code: '7' },
            { name: '8', code: '8' },
            { name: '9', code: '9' },
            { name: '10', code: '0' }, // 10 is 0 in this API
            { name: 'Jack', code: 'J' },
            { name: 'Queen', code: 'Q' },
            { name: 'King', code: 'K' }
        ];

        const suit = suits[Math.floor(Math.random() * suits.length)];
        const rank = ranks[Math.floor(Math.random() * ranks.length)];

        const cardName = `${rank.name} of ${suit.symbol} ${suit.name}`;
        const imageUrl = `https://deckofcardsapi.com/static/img/${rank.code}${suit.code}.png`;

        const embed = new EmbedBuilder()
            .setTitle('🃏 You drew a card')
            .setThumbnail(imageUrl);

        await interaction.reply({ embeds: [embed] });
    },
};
