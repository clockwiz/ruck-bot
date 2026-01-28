const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

// 🔒 Tracks users who currently have a hidden card
const activeCards = new Map(); // userId -> true

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fatcardhidden')
        .setDescription('Draws a random card only you can see. You may reveal it once.'),
    async execute(interaction) {

        // ❌ Block rerolling
        if (activeCards.has(interaction.user.id)) {
            return interaction.reply({
                content: "❌ You already have a hidden card. Reveal it (or wait for it to expire) before drawing a new one.",
                ephemeral: true
            });
        }

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

        // 🎴 Draw card
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const rank = ranks[Math.floor(Math.random() * ranks.length)];

        const cardName = `${rank.name} of ${suit.symbol} ${suit.name}`;
        const imageUrl = `https://deckofcardsapi.com/static/img/${rank.code}${suit.code}.png`;

        // 🔐 Lock user
        activeCards.set(interaction.user.id, true);

        const privateEmbed = new EmbedBuilder()
            .setTitle('🃏 Your hidden card')
            .setDescription(`**${cardName}**\n\nOnly you can see this.\nClick the button below if you want to reveal it.`)
            .setImage(imageUrl);

        const revealButton = new ButtonBuilder()
            .setCustomId('fatcard_reveal')
            .setLabel('Reveal to everyone')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(revealButton);

        // 👤 Private reply
        await interaction.reply({
            embeds: [privateEmbed],
            components: [row],
            ephemeral: true
        });

        // 🎯 Button collector
        const filter = i =>
            i.customId === 'fatcard_reveal' &&
            i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60_000 // 1 minute
        });

        // ✅ When revealed
        collector.on('collect', async i => {

            const publicEmbed = new EmbedBuilder()
                .setTitle(`🃏 ${interaction.user.username} reveals their card`)
                .setDescription(`**${cardName}**`)
                .setImage(imageUrl);

            await i.reply({
                embeds: [publicEmbed]
            });

            await interaction.editReply({
                components: [] // remove button
            });

            activeCards.delete(interaction.user.id); // 🔓 unlock
            collector.stop();
        });

        // ⏱️ When time runs out
        collector.on('end', async () => {
            activeCards.delete(interaction.user.id);

            try {
                await interaction.editReply({
                    components: []
                });
            } catch (e) {
                // message may already be gone, safe to ignore
            }
        });
    },
};
