const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../bossTimers.json');
let bossTimers = new Map();

// Boss-specific locations
const bossLocations = {
    BF: ['Forgotten Path'],
    HH: [
        'Hollowed',
        'Forgotten Path',
        'Hidden Evil',
        'Creeping Evil',
        'CR1',
        'CR2',
        'CR3'
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
            console.log('✅ Boss timers loaded from file.');
        }
    } catch (err) {
        console.error('⚠️ Failed to load boss timers:', err);
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

// Schedule reminders for respawn
function scheduleReminder(client, boss, respawnTime, channelId) {
    const delay = respawnTime.getTime() - Date.now();
    if (delay <= 0) return;

    setTimeout(async () => {
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                await channel.send(`⚔️ **${boss}** has respawned!`);
            }
            for (const [key, info] of bossTimers.entries()) {
                if (info.boss === boss && info.channelId === channelId && info.respawnTime.getTime() === respawnTime.getTime()) {
                    bossTimers.delete(key);
                    break;
                }
            }
            saveTimers();
        } catch (err) {
            console.error(`Failed to send reminder for ${boss}:`, err);
        }
    }, delay);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bosstimer')
        .setDescription('Manage boss timers.')
        .addSubcommand(sub =>
            sub
                .setName('add')
                .setDescription('Add a boss timer.')
                .addStringOption(opt =>
                    opt
                        .setName('boss')
                        .setDescription('Select the boss')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Big Foot', value: 'BF' },
                            { name: 'Headless Horseman', value: 'HH' }
                        )
                )
                .addStringOption(opt =>
                    opt
                        .setName('channel')
                        .setDescription('Select which channel (1-4) the timer is for')
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
                        .setDescription('Select the boss location')
                        .setRequired(true)
                        .addChoices(
                            ...[].concat(
                                bossLocations.BF.map(loc => ({ name: loc, value: loc })),
                                bossLocations.HH.map(loc => ({ name: loc, value: loc }))
                            )
                        )
                )
                .addStringOption(opt =>
                    opt
                        .setName('datetime')
                        .setDescription('Optional: Specify date and time as MM/DD HH:MM. Defaults to now.')
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('delete')
                .setDescription('Delete a boss timer')
                .addStringOption(opt =>
                    opt.setName('boss').setDescription('Boss name').setRequired(true)
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
        .addSubcommand(sub =>
            sub.setName('list').setDescription('Show all boss timers')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'add') {
            const boss = interaction.options.getString('boss');
            const channelChoice = interaction.options.getString('channel');
            const channelMap = {
                '1': '<CHANNEL_ID_1>',
                '2': '<CHANNEL_ID_2>',
                '3': '<CHANNEL_ID_3>',
                '4': '<CHANNEL_ID_4>'
            };
            const channelId = channelMap[channelChoice];
            if (!channelId) return interaction.reply('⚠️ Invalid channel selection.');

            const location = interaction.options.getString('location');
            let now = new Date();
            const timeInput = interaction.options.getString('datetime'); // fixed here

            if (timeInput) {
                // Split into MM/DD and HH:MM
                const [datePart, timePart] = timeInput.split(' ');
                if (!datePart || !timePart) return interaction.reply('⚠️ Invalid format. Use MM/DD HH:MM');

                const [month, day] = datePart.split('/').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);

                if (![month, day, hours, minutes].every(Number.isInteger))
                    return interaction.reply('⚠️ Invalid format. Use MM/DD HH:MM');

                const year = new Date().getFullYear();
                now = new Date(year, month - 1, day, hours, minutes, 0, 0);
            }

            const respawn = new Date(now.getTime() + 6 * 60 * 60 * 1000);
            const key = `${boss}-${channelChoice}-${location}`;
            bossTimers.set(key, { boss, channelChoice, location, respawnTime: respawn, channelId });

            saveTimers();
            scheduleReminder(interaction.client, boss, respawn, channelId);

            await interaction.reply(
                `✅ Timer set for **${boss}** in channel ${channelChoice} at location **${location}** — respawns <t:${Math.floor(respawn.getTime()/1000)}:t>`
            );
        } else if (sub === 'delete') {
            const boss = interaction.options.getString('boss');
            const channelChoice = interaction.options.getString('channel');
            const location = interaction.options.getString('location');
            const key = `${boss}-${channelChoice}-${location}`;
            if (!bossTimers.has(key)) {
                await interaction.reply(`⚠️ No timer found for **${boss}** in channel ${channelChoice} at location ${location}.`);
                return;
            }
            bossTimers.delete(key);
            saveTimers();
            await interaction.reply(`🗑️ Deleted timer for **${boss}** in channel ${channelChoice} at location ${location}.`);
        } else if (sub === 'list') {
            await interaction.deferReply();

            const bossDisplayNames = { BF: 'BF', HH: 'HH' };
            const bosses = Object.keys(bossLocations);
            const channels = ['1', '2', '3', '4'];

            let msg = '⏰ **Current Boss Timers:**\n';

            for (const boss of bosses) {
                const locations = bossLocations[boss];
                for (const location of locations) {
                    for (const channelChoice of channels) {
                        const key = `${boss}-${channelChoice}-${location}`;
                        if (bossTimers.has(key)) {
                            const info = bossTimers.get(key);
                            const respawnTime = info.respawnTime;

                            const now = new Date(); // bot current time in UTC
                            const remainingMs = info.respawnTime.getTime() - now.getTime(); 
                            const hours = Math.floor(remainingMs / 3600000);
                            const minutes = Math.floor((remainingMs % 3600000) / 60000);
                            const remainingStr = remainingMs > 0 ? `(${hours}h ${minutes}m)` : '(Expired)';
                            const timestamp = Math.floor(respawnTime.getTime() / 1000);

                            msg += `• **${bossDisplayNames[boss]}** — ${location} — cc ${channelChoice} — spawns <t:${timestamp}:t> ${remainingStr}\n`;
                        } else {
                            msg += `• **${bossDisplayNames[boss]}** — ${location} — cc ${channelChoice} — NIL\n`;
                        }
                    }
                }
            }

            if (msg.length > 2000) {
                msg = msg.substring(0, 1990) + '\n...';
            }

            await interaction.followUp(msg);
        }
    },

    init(client) {
        loadTimers();
        for (const [, info] of bossTimers.entries()) {
            scheduleReminder(client, info.boss, info.respawnTime, info.channelId);
        }
        console.log('⏲️ Scheduled boss reminders restored.');
    }
};
