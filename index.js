const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');

let token;

// Try Render secret file first
const renderConfigPath = '/etc/secrets/config.json';
// Fallback to local config.json in project root
const localConfigPath = path.join(__dirname, 'config.json');

try {
    if (fs.existsSync(renderConfigPath)) {
        const config = JSON.parse(fs.readFileSync(renderConfigPath, 'utf8'));
        token = config.token;
        console.log('✅ Using token from Render secret file.');
    } else if (fs.existsSync(localConfigPath)) {
        const config = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
        token = config.token;
        console.log('✅ Using token from local config.json.');
    } else {
        throw new Error('No config file found.');
    }
} catch (err) {
    console.error('Failed to read token. Make sure the config file exists locally or on Render.', err);
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    // Initialize boss timers (load JSON, schedule reminders)
    const bosstimerCommand = client.commands.get('bosstimer');
    if (bosstimerCommand && bosstimerCommand.init) {
        bosstimerCommand.init(client);
    }
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

// Log in to Discord with your client's token
client.login(token);
