const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../bossTimers.json');
let bossTimers = new Map();

// Boss-specific locations
const bossLocations = {
    BF: [
        'Forgotten Path',
        'The Evil Dead',
        'TP1',
        'TP2',
        'TP3',
        'TP4',
        'TP5'
    ],
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

function saveTimers() {
    const obj = {};
    for (const [key, info] of bossTimers.entries()) {
        obj[key] = { ...info, respawnTime: info.respawnTime.toISOString() };
    }
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

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
                            ...bossLocations.BF.map(loc => ({ name: loc, value: loc }))
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
                            ...bossLocations.HH.map(loc => ({ name: loc, value: loc }))
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

        // Map channels
        const channelMap = {
            '1': '<CHANNEL_ID_1>',
            '2': '<CHANNEL_ID_2>',
            '3': '<CHANNEL_ID_3>',
            '4': '<CHANNEL_ID_4>'
        };

        // ADD-BF
        if (sub === 'add-bf') {
            const boss = 'BF';
            const channelChoice = interaction.options.getString('channel');
            const channelId = channelMap[channelChoice];
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

            const respawn = new Date(now.getTime() + 12 * 60 * 60 * 1000); // ⏰ 12 hours
            const key = `${boss}-${channelChoice}-${location}`;
            bossTimers.set(key, { boss, channelChoice, location, respawnTime: respawn, channelId });

            saveTimers();
            scheduleReminder(interaction.client, boss, respawn, channelId);

            await interaction.reply(
                `✅ BF timer set in cc${channelChoice} at **${location}** — respawns <t:${Math.floor(respawn.getTime()/1000)}:t>`
            );
        }

        // ADD-HH
        else if (sub === 'add-hh') {
            const boss = 'HH';
            const channelChoice = interaction.options.getString('channel');
            const channelId = channelMap[channelChoice];
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

            const respawn = new Date(now.getTime() + 6 * 60 * 60 * 1000); // ⏰ 6 hours
            const key = `${boss}-${channelChoice}-${location}`;
            bossTimers.set(key, { boss, channelChoice, location, respawnTime: respawn, channelId });

            saveTimers();
            scheduleReminder(interaction.client, boss, respawn, channelId);

            await interaction.reply(
                `✅ HH timer set in cc${channelChoice} at **${location}** — respawns <t:${Math.floor(respawn.getTime()/1000)}:t>`
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

            let msg = `⏰ **Current ${bossDisplay} Timers:**\n`;

            for (const location of bossLocations[boss]) {
                for (const channelChoice of channels) {
                    const key = `${boss}-${channelChoice}-${location}`;
                    if (bossTimers.has(key)) {
                        const info = bossTimers.get(key);
                        const timestamp = Math.floor(info.respawnTime.getTime() / 1000);

                        msg += `• **${location}** — cc${channelChoice} — spawns <t:${timestamp}:t> (<t:${timestamp}:R>)\n`;
                    } else {
                        msg += `• **${location}** — cc${channelChoice} — NIL\n`;
                    }
                }
            }

            if (msg.length > 2000) msg = msg.substring(0, 1990) + '\n...';
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
