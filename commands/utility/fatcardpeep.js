const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fatcardpeep')
        .setDescription('Slowly peeks across a random card before revealing it.'),
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

        // Pick a random card
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const rank = ranks[Math.floor(Math.random() * ranks.length)];

        const cardName = `${rank.name} of ${suit.symbol} ${suit.name}`;
        const imageUrl = `https://deckofcardsapi.com/static/img/${rank.code}${suit.code}.png`;

        const revealEmbed = new EmbedBuilder()
            .setImage(imageUrl);

        // Step 1 — reply immediately
        await interaction.reply({ content: "🂠 Shuffling the deck..." });

        // Load card image
        const img = await loadImage(imageUrl);
        const sliceWidth = Math.floor(img.width * 0.10);  // 10% vertical slice
        const canvas = createCanvas(sliceWidth, img.height);
        const ctx = canvas.getContext('2d');

        const steps = 8;    // how many sliding frames
        const delay = 300;  // ms between frames

        for (let i = 0; i < steps; i++) {
            // Slide horizontally, starting from a bit right of top-left corner
            const startX = Math.floor(img.width * 0.15 + (i * (img.width * 0.7 / steps)));

            ctx.clearRect(0, 0, sliceWidth, img.height);
            ctx.drawImage(
                img,
                startX, 0,        // source x, y
                sliceWidth, img.height,  // source width, height
                0, 0,             // destination x, y
                sliceWidth, img.height   // destination width, height
            );

            const slideImage = new AttachmentBuilder(canvas.toBuffer(), { name: `peep${i}.png` });

            await new Promise(r => setTimeout(r, delay));

            await interaction.editReply({
                content: "👀 Peeking at the card...",
                files: [slideImage],
                embeds: []
            });
        }

        // Step 3 — reveal full card
        setTimeout(() => {
            interaction.editReply({
                content: "",
                embeds: [revealEmbed],
                files: []
            });
        }, delay);
    },
};
