const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const normalCommands = [];
const bossTimerCommands = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!('data' in command && 'execute' in command)) {
      console.log(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
      continue;
    }

    // 👇 THIS is the only logic change
    if (command.data.name === 'bosstimer') {
      bossTimerCommands.push(command.data.toJSON());
    } else {
      normalCommands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Refreshing normal commands (global)...');

    // 🌍 All normal commands → everywhere
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: normalCommands }
    );

    console.log('Refreshing bosstimer (guild-only)...');

    // 🏰 bosstimer → ONLY this server
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: bossTimerCommands }
    );

    console.log('✅ Commands deployed successfully.');
  } catch (error) {
    console.error(error);
  }
})();
