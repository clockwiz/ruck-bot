const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fatcardhidden')
        .setDescription('Draws a random card only you can see, with an option to reveal it.'),
    async execute(interaction) {

        const suits = [
            { name: 'Spades', symbol: '♠', code: 'S' },
            { name: 'Hearts', symbol: '♥', code: 'H' },
            { name: 'Diamonds', symbol: '♦', code: 'D' },
            { name: 'Clubs', symbol: '♣', code: 'C' }
        ];

        const ranks = [
            { name: 'Ace', code: 'A' }, { name: '2', code: '2' }, { name: '3', code: '3' },
            { name: '4', code: '4' }, { name: '5', code: '5' }, { name: '6', code: '6' },
            { name: '7', code: '7' }, { name: '8', code: '8' }, { name: '9', code: '9' },
            { name: '10', code: '0' }, { name: 'Jack', code: 'J' },
            { name: 'Queen', code: 'Q' }, { name: 'King', code: 'K' }
        ];

        const suit = suits[Math.floor(Math.random() * suits.length)];
        const rank = ranks[Math.floor(Math.random() * ranks.length)];

        const cardName = `${rank.name} of ${suit.symbol} ${suit.name}`;
        const imageUrl = `https://deckofcardsapi.com/static/img/${rank.code}${suit.code}.png`;

        const privateEmbed = new EmbedBuilder()
            .setTitle('🃏 Your hidden card')
            .setDescription(`**${cardName}**\nOnly you can see this. Click reveal to show everyone.`)
            .setImage(imageUrl);

        const revealButton = new ButtonBuilder()
            .setCustomId('fatcard_reveal')
            .setLabel('Reveal to everyone')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(revealButton);

        // Step 1: Private card
        await interaction.reply({
            embeds: [privateEmbed],
            components: [row],
            ephemeral: true
        });

        // Step 2: Button handler (collector)
        const filter = i => i.customId === 'fatcard_reveal' && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60_000 // 1 minute
        });

        collector.on('collect', async i => {
            const publicEmbed = new EmbedBuilder()
                .setTitle(`🃏 ${interaction.user.username} reveals their card`)
                .setDescription(`**${cardName}**`)
                .setImage(imageUrl);

            await i.reply({
                embeds: [publicEmbed] // public message
            });

            await interaction.editReply({
                components: [] // remove button
            });

            collector.stop();
        });
    },
};
