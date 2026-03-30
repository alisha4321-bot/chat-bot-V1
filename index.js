const login = require("fca-project-orion");
const fs = require("fs");

// Appstate load korar jonno niche code dewa holo
const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

login({appState: appState}, (err, api) => {
    if(err) {
        // Jodi login e somossa hoy tahole error dekhabe
        return console.error("Login Error: " + err);
    }

    console.log("Bot successfully login hoyeche! Now active.");

    // Keu message dile bot ekhane response korbe
    api.listenMqtt((err, message) => {
        if(err) return console.error(err);

        // Simple "hi" command check
        if(message.body && message.body.toLowerCase() == "hi") {
            api.sendMessage("Hello! I am God Bot V1. Created by [Your Name]. How can I help you?", message.threadID);
        }
    });
});
