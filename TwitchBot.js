const MarkovChain = require("./MarkovChain.js");
const tmi = require("tmi.js");
const fs = require("fs");

var textData = {};
var allChunks = {};

const config = JSON.parse(fs.readFileSync("credentials.json", "utf8"));
const blacklist = JSON.parse(fs.readFileSync("blacklist.json", "utf8"));
const commandCd = 0;//10000;
const resetCd = 1800000;
const ignoredNames = ["nightbot", "scootycoolguy"]
const channel = config.channels[0];
const clientid = config.clientid;
var commandTime = Date.now();
var resetTime = Date.now();
var messages = 0;




function inBlacklist (text) {
    //Checks whether or not the text breaks the blacklist
    let removeStrings = [",", ".", "`", "'", "/", "?"]
    for (var i = 0; i < 5; i++) {
        text.replace(removeStrings[i], "");
    }
    text = text.toLowerCase();
    var splitText = text.split(" ");
    const singleWords = blacklist["singleWords"];
    const fullPhrases = blacklist["fullPhrases"];
    const regex = blacklist["regex"];

    for (var i = 0; i < singleWords.length; i++) {
        if (splitText.includes(singleWords[i])) {
            return true;
        }
    }
    for (var i = 0; i < fullPhrases.length; i++) {
        if (text.includes(fullPhrases[i])) {
            return true;
        }
    }
    for (var i = 0; i < regex.length; i++) {
        let regPattern = new RegExp(regex[i]);
        if (regPattern.test(text)) {
            return true;
        }
    }
    return false;
}

async function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot
    messages += 1;
    if (context["message-type"] == "whisper") {
        client.say(target, "I am a bot and can not whisper you back");
    }

    const commandName = msg.trim().toLowerCase().replace("@", "").split(" ");
    const username = context.username;

    //If the command is !chain, make a chain and reset the cooldowns for auto print and commands
    if (commandName[0] == "!chain" && Date.now() - commandTime > commandCd) {
            client.say(target, MarkovChain.makeChain(textData, allChunks));
            commandTime = Date.now();
    } else if (commandName[0] == "!markovbot" && Date.now() - commandTime > commandCd) {
        client.say(target, `${context.username} Markov Chain Bot is a bot created by Buksss
            that imitates chat using a system called a Markov Chain. You can activate it
            by typing !chain, or by waiting for it to say something on its own`);
            commandTime = Date.now();

    } else {
        if (inBlacklist(msg) || ignoredNames.includes(context.username)) {
            return;
        }
        console.log(`${context.username}: ${msg}`);
        //Add the data of every new message to the cache
        let newData = MarkovChain.chunkText(msg, textData, allChunks);
        textData = newData[0];
        allChunks = newData[1];
        //If the cooldown for printing every 5 minutes is over, make a chain automatically
        if (messages > 150) {
            client.say(target, MarkovChain.makeChain(textData, allChunks));
            messages = 0;
        }
    }
    //If the reset cooldown is over, empty the cache
    if (Date.now() - resetTime > resetCd) {
        resetTime = Date.now();
        textData = {};
        allChunks = {};
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}

const client = new tmi.client(config);

client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);
client.connect();
