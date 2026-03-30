const login = require("fca-project-orion");
const fs = require("fs-extra");
const path = require("path");

// Load settings
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

// Command and Event storage
const commands = new Map();

// Banglish Guide: Sob .js command load kora hocche
const commandPath = path.join(__dirname, "modules", "commands");
if (!fs.existsSync(commandPath)) fs.mkdirpSync(commandPath);

const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    try {
        const command = require(path.join(commandPath, file));
        if (command.config && command.run) {
            commands.set(command.config.name, command);
            console.log(`[ Loaded ] ${command.config.name}`);
        }
    } catch (e) {
        console.log(`[ Error ] ${file} load korte somossa: `, e);
    }
}

login({appState: appState}, (err, api) => {
    if(err) return console.error("Login Error: " + err);

    api.setOptions({ listenEvents: true, selfListen: false });
    console.log(`[ ${config.botName} ] Successfully Started!`);

    api.listenMqtt(async (err, event) => {
        if (err) return;
        const { threadID, body } = event;
        const prefix = config.prefix;

        if (body && body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (commands.has(commandName)) {
                try {
                    const command = commands.get(commandName);
                    // Pass all essential tools to the command file
                    command.run({ api, event, args, config, fs, path });
                } catch (e) {
                    api.sendMessage(`[ Error ] Command execution failed: ${e.message}`, threadID);
                }
            }
        }
    });
});
