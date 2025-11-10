const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../bossTimers.json');
let bossTimers = new Map();

// Boss-specific locations
const bossLocations = {
    BF: [
        { input: 'Forgotten Path', display: 'F Path' },
        { input: 'Evil Dead', display: 'Evil Dead' },
        { input: 'Evil Rising', display: 'Evil Rising' },
        { input: 'TP1', display: 'TP1' },
        { input: 'TP2', display: 'TP2' },
        { input: 'TP3', display: 'TP3' },
        { input: 'TP4', display: 'TP4' },
        { input: 'TP5', display: 'TP5' }
    ],
    HH: [
        { input: 'Hollowed', display: 'Hollowed' },
        { input: 'Forgotten Path', display: 'Forgotten Path' },
        { input: 'Hidden Evil', display: 'Hidden Evil' },
        { input: 'Creeping Evil', display: 'Creeping Evil' },
        { input: 'CR1', display: 'CR1' },
        { input: 'CR2', display: 'CR2' },
        { input: 'CR3', display: 'CR3' }
    ]
};

// Load timers from file
function loadTimers() {
    try {
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            for (const [key, info] of Object.entries(data)) {
                bossTimers.set(key, { ...info, respawnTime: new Date(info.respawnTime) });
            }
            console.log('Boss timers loaded from file.');
        }
    } catch (err) {
        console.error('Failed to load boss timers:', err);
    }
}

// Save timers to file
function saveTimers() {
    const obj = {};
    for (const [key, info] of bossTimers.entries()) {
        obj[key] = { ...info, respawnTime: info.respawnTime.toISOString() };
    }
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bosstimer')
        .setDescription('Manage boss timers.')

        // 💀 ADD-BF (Big Foot)
        .addSubcommand(sub =>
            sub
                .setName('add-bf')
                .setDescription('Add a Big Foot timer.')
                .addStringOption(opt =>
                    opt
                        .setName('channel')
                        .setDescription('Select which channel (1-4)')
                        .setRequired(true)
                        .addChoices(
                            { name: '1', value: '1' },
                            { name: '2', value: '2' },
                            { name: '3', value: '3' },
                            { name: '4', value: '4' }
                        )
                )
                .addStringOption(opt =>
                    opt
                        .setName('location')
                        .setDescription('Select the Big Foot location')
                        .setRequired(true)
                        .addChoices(
                            ...bossLocations.BF.map(loc => ({ name: loc.input, value: loc.input }))
                        )
                )
                .addStringOption(opt =>
                    opt
                        .setName('datetime')
                        .setDescription('Optional: Specify date/time as MM/DD HH:MM')
                        .setRequired(false)
                )
        )

        // 🎃 ADD-HH (Headless Horseman)
        .addSubcommand(sub =>
            sub
                .setName('add-hh')
                .setDescription('Add a Headless Horseman timer.')
                .addStringOption(opt =>
                    opt
                        .setName('channel')
                        .setDescription('Select which channel (1-4)')
                        .setRequired(true)
                        .addChoices(
                            { name: '1', value: '1' },
                            { name: '2', value: '2' },
                            { name: '3', value: '3' },
                            { name: '4', value: '4' }
                        )
                )
                .addStringOption(opt =>
                    opt
                        .setName('location')
                        .setDescription('Select the HH location')
                        .setRequired(true)
                        .addChoices(
                            ...bossLocations.HH.map(loc => ({ name: loc.input, value: loc.input }))
                        )
                )
                .addStringOption(opt =>
                    opt
                        .setName('datetime')
                        .setDescription('Optional: Specify date/time as MM/DD HH:MM')
                        .setRequired(false)
                )
        )

        // 🗑 DELETE
        .addSubcommand(sub =>
            sub
                .setName('delete')
                .setDescription('Delete a boss timer.')
                .addStringOption(opt =>
                    opt.setName('boss').setDescription('Boss name').setRequired(true)
                        .addChoices(
                            { name: 'Big Foot', value: 'BF' },
                            { name: 'Headless Horseman', value: 'HH' }
                        )
                )
                .addStringOption(opt =>
                    opt
                        .setName('channel')
                        .setDescription('Which channel to delete')
                        .setRequired(true)
                        .addChoices(
                            { name: '1', value: '1' },
                            { name: '2', value: '2' },
                            { name: '3', value: '3' },
                            { name: '4', value: '4' }
                        )
                )
                .addStringOption(opt =>
                    opt
                        .setName('location')
                        .setDescription('Location of the boss to delete')
                        .setRequired(true)
                )
        )

        // ⏰ LIST
        .addSubcommand(sub =>
            sub
                .setName('list')
                .setDescription('Show all boss timers for a specific boss.')
                .addStringOption(opt =>
                    opt
                        .setName('boss')
                        .setDescription('Which boss to show (BF or HH)')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Big Foot', value: 'BF' },
                            { name: 'Headless Horseman', value: 'HH' }
                        )
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // ADD-BF
        if (sub === 'add-bf') {
            const boss = 'BF';
            const channelChoice = interaction.options.getString('channel');
            const location = interaction.options.getString('location');
            let now = new Date();

            const timeInput = interaction.options.getString('datetime');
            if (timeInput) {
                const [datePart, timePart] = timeInput.split(' ');
                const [month, day] = datePart.split('/').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);
                const year = new Date().getFullYear();
                now = new Date(year, month - 1, day, hours, minutes);
            }

            const respawn = new Date(now.getTime() + 12 * 60 * 60 * 1000);
            const key = `${boss}-${channelChoice}-${location}`;
            bossTimers.set(key, { boss, channelChoice, location, respawnTime: respawn });

            saveTimers();

            await interaction.reply(
                `✅ BF timer set in cc${channelChoice} at **${location}** — respawns <t:${Math.floor(respawn.getTime()/1000)}:t> (<t:${Math.floor(respawn.getTime()/1000)}:R>)`
            );
        }

        // ADD-HH
        else if (sub === 'add-hh') {
            const boss = 'HH';
            const channelChoice = interaction.options.getString('channel');
            const location = interaction.options.getString('location');
            let now = new Date();

            const timeInput = interaction.options.getString('datetime');
            if (timeInput) {
                const [datePart, timePart] = timeInput.split(' ');
                const [month, day] = datePart.split('/').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);
                const year = new Date().getFullYear();
                now = new Date(year, month - 1, day, hours, minutes);
            }

            const respawn = new Date(now.getTime() + 6 * 60 * 60 * 1000);
            const key = `${boss}-${channelChoice}-${location}`;
            bossTimers.set(key, { boss, channelChoice, location, respawnTime: respawn });

            saveTimers();

            await interaction.reply(
                `✅ HH timer set in cc${channelChoice} at **${location}** — respawns <t:${Math.floor(respawn.getTime()/1000)}:t> (<t:${Math.floor(respawn.getTime()/1000)}:R>)`
            );
        }

        // DELETE
        else if (sub === 'delete') {
            const boss = interaction.options.getString('boss');
            const channelChoice = interaction.options.getString('channel');
            const location = interaction.options.getString('location');
            const key = `${boss}-${channelChoice}-${location}`;
            if (!bossTimers.has(key))
                return interaction.reply(`⚠️ No timer found for **${boss}** in cc${channelChoice} at ${location}.`);
            bossTimers.delete(key);
            saveTimers();
            await interaction.reply(`🗑️ Deleted timer for **${boss}** in cc${channelChoice} at ${location}.`);
        }

        // LIST
        else if (sub === 'list') {
            await interaction.deferReply();
            const boss = interaction.options.getString('boss');
            const bossDisplay = boss === 'BF' ? 'Big Foot' : 'Headless Horseman';
            const channels = ['1', '2', '3', '4'];

            const timers = [];

            // Gather all timers
            for (const loc of bossLocations[boss]) {
                const locationInput = loc.input;
                const locationDisplay = loc.display;
                for (const channelChoice of channels) {
                    const key = `${boss}-${channelChoice}-${locationInput}`;
                    if (bossTimers.has(key)) {
                        timers.push({
                            locationDisplay,
                            channelChoice,
                            respawnTime: bossTimers.get(key).respawnTime
                        });
                    } else {
                        timers.push({
                            locationDisplay,
                            channelChoice,
                            respawnTime: null
                        });
                    }
                }
            }

            // Sort timers
            const now = new Date();
            timers.sort((a, b) => {
                // NIL first
                if (!a.respawnTime) return -1;
                if (!b.respawnTime) return 1;

                const aDiff = a.respawnTime - now;
                const bDiff = b.respawnTime - now;

                // Future timers: longest remaining first
                if (aDiff > 0 && bDiff > 0) return bDiff - aDiff;

                // Past timers: oldest expired first
                if (aDiff <= 0 && bDiff <= 0) return aDiff - bDiff;

                // Mix of past/future: future before past
                return aDiff > 0 ? -1 : 1;
            });

            // Build message
            let msg = `⏰ **Current ${bossDisplay} Timers:**\n`;
            for (const t of timers) {
                if (!t.respawnTime) {
                    msg += `• **${t.locationDisplay}** — cc${t.channelChoice} — NIL\n`;
                } else {
                    const ts = Math.floor(t.respawnTime.getTime() / 1000);
                    msg += `• **${t.locationDisplay}** — cc${t.channelChoice} — spawns <t:${ts}:t> (<t:${ts}:R>)\n`;
                }
            }

            if (msg.length > 2000) msg = msg.substring(0, 1990) + '\n...';
            await interaction.followUp(msg);
        }
    },

    init(client) {
        loadTimers();
    }
};
