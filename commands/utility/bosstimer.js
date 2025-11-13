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
    ],
    AHMA: [] // No location needed
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

        // 👵 ADD-AHMA
        .addSubcommand(sub =>
            sub
                .setName('add-ahma')
                .setDescription('Add an Ah Ma timer.')
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
                            { name: 'Headless Horseman', value: 'HH' },
                            { name: 'Ah Ma', value: 'AHMA' }
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
                        .setDescription('Location of the boss to delete (for BF/HH only)')
                        .setRequired(false)
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
                        .setDescription('Which boss to show')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Big Foot', value: 'BF' },
                            { name: 'Headless Horseman', value: 'HH' },
                            { name: 'Ah Ma', value: 'AHMA' }
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

            await interaction.reply(`✅ BF timer set in cc${channelChoice} at **${location}** — respawns <t:${Math.floor(respawn.getTime()/1000)}:t> (<t:${Math.floor(respawn.getTime()/1000)}:R>)`);
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

            await interaction.reply(`✅ HH timer set in cc${channelChoice} at **${location}** — respawns <t:${Math.floor(respawn.getTime()/1000)}:t> (<t:${Math.floor(respawn.getTime()/1000)}:R>)`);
        }

        // ADD-AHMA
        else if (sub === 'add-ahma') {
            const boss = 'AHMA';
            const channelChoice = interaction.options.getString('channel');
            let now = new Date();

            const timeInput = interaction.options.getString('datetime');
            if (timeInput) {
                const [datePart, timePart] = timeInput.split(' ');
                const [month, day] = datePart.split('/').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);
                const year = new Date().getFullYear();
                now = new Date(year, month - 1, day, hours, minutes);
            }

            const respawn = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
            const key = `${boss}-${channelChoice}`;
            bossTimers.set(key, { boss, channelChoice, respawnTime: respawn });
            saveTimers();

            await interaction.reply(`✅ Ah Ma timer set in cc${channelChoice} — respawns <t:${Math.floor(respawn.getTime()/1000)}:t> (<t:${Math.floor(respawn.getTime()/1000)}:R>)`);
        }

        // DELETE
        else if (sub === 'delete') {
            const boss = interaction.options.getString('boss');
            const channelChoice = interaction.options.getString('channel');
            const location = interaction.options.getString('location');
            const key = boss === 'AHMA' ? `${boss}-${channelChoice}` : `${boss}-${channelChoice}-${location}`;
            if (!bossTimers.has(key))
                return interaction.reply(`⚠️ No timer found for **${boss}** in cc${channelChoice}${location ? ` at ${location}` : ''}.`);
            bossTimers.delete(key);
            saveTimers();
            await interaction.reply(`🗑️ Deleted timer for **${boss}** in cc${channelChoice}${location ? ` at ${location}` : ''}.`);
        }

        // LIST
        else if (sub === 'list') {
            await interaction.deferReply();
            const boss = interaction.options.getString('boss');
            const bossDisplay = boss === 'BF' ? 'Big Foot' : boss === 'HH' ? 'Headless Horseman' : 'Ah Ma';
            const channels = ['1', '2', '3', '4'];
            const timers = [];

            if (boss === 'AHMA') {
                // Ah Ma — no location
                for (const channelChoice of channels) {
                    const key = `${boss}-${channelChoice}`;
                    if (bossTimers.has(key)) {
                        timers.push({ channelChoice, respawnTime: bossTimers.get(key).respawnTime });
                    } else {
                        timers.push({ channelChoice, respawnTime: null });
                    }
                }
            } else {
                // BF and HH — include locations
                for (const loc of bossLocations[boss]) {
                    const locationInput = loc.input;
                    const locationDisplay = loc.display;
                    for (const channelChoice of channels) {
                        const key = `${boss}-${channelChoice}-${locationInput}`;
                        if (bossTimers.has(key)) {
                            timers.push({ locationDisplay, channelChoice, respawnTime: bossTimers.get(key).respawnTime });
                        } else {
                            timers.push({ locationDisplay, channelChoice, respawnTime: null });
                        }
                    }
                }
            }

            const now = new Date();

            // Convert any Big Foot timers older than 24h ago into NIL
            if (boss === 'BF') {
                const now = new Date();
                for (const t of timers) {
                    if (t.respawnTime && (now - t.respawnTime) > 24 * 60 * 60 * 1000) {
                        t.respawnTime = null;
                    }
                }
            }

            timers.sort((a, b) => {
                const now = new Date();

                // 1️⃣ NILs first
                if (!a.respawnTime && b.respawnTime) return -1;
                if (a.respawnTime && !b.respawnTime) return 1;
                if (!a.respawnTime && !b.respawnTime) return 0;

                const aFuture = a.respawnTime > now;
                const bFuture = b.respawnTime > now;

                // 2️⃣ Future timers before past timers
                if (aFuture && !bFuture) return -1;
                if (!aFuture && bFuture) return 1;

                // 3️⃣ Within each group:
                //     - Future: sort descending (latest → soonest)
                //     - Past: sort descending (most recent → oldest)
                if (aFuture && bFuture) return b.respawnTime - a.respawnTime;
                if (!aFuture && !bFuture) return b.respawnTime - a.respawnTime;

                return 0;
            });

            let msg = `⏰ **Current ${bossDisplay} Timers:**\n`;

            for (const t of timers) {
                if (boss === 'AHMA') {
                    // Ah Ma — no location
                    if (!t.respawnTime) {
                        msg += `• cc${t.channelChoice} — NIL\n`;
                    } else {
                        const ts = Math.floor(t.respawnTime.getTime() / 1000);
                        msg += `• cc${t.channelChoice} — spawns <t:${ts}:t> (<t:${ts}:R>)\n`;
                    }
                } else {
                    // BF / HH — location first, bolded
                    if (!t.respawnTime) {
                        msg += `• **${t.locationDisplay}** — cc${t.channelChoice} — NIL\n`;
                    } else {
                        const ts = Math.floor(t.respawnTime.getTime() / 1000);
                        msg += `• **${t.locationDisplay}** — cc${t.channelChoice} — spawns <t:${ts}:t> (<t:${ts}:R>)\n`;
                    }
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
