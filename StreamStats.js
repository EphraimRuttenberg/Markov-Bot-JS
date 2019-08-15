const axios = require("axios");

module.exports = {

streaming: async function(channel, clientid) {
    const url = `https://api.twitch.tv/kraken/streams/${channel}?client_id=${clientid}`;
    var stream = (await axios.get(url)).data.stream;
    return !(stream == null);
},

getMonths: async function(user, channel){
    let url = `https://overrustlelogs.xyz/stalk?channel=${channel}&nick=${user}`;
    var html = (await axios.get(url)).data;
    //Get all cases of a month followed by a year
    const expression = /(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})/g;
    var months = html.match(expression);
    if (months == null) {
        return [];
    }
    var monthsUnique = [];
    //Remove duplicates
    for (var i = 0; i < months.length; i++) {
        if (!monthsUnique.includes(months[i])) {
            monthsUnique.push(months[i])
        }
    }
    return monthsUnique;
},

getMessages: async function(months, user) {
    var finalMessages = [];
    for (var i = 0; i < months.length; i++) {
        let date = months[i].split(" ");
        let url = `https://overrustlelogs.net/moonmoon_ow%20chatlog/${date[0]}%20${date[1]}/userlogs/${user}.txt`
        try {
            var messages = (await axios.get(url)).data.split("\n");
        } catch (err) {}
            continue;
        }
        for (var j = 0; j < messages.length; j++) {
            let message = messages[j].split(`${user}: `)[1];
            if (typeof message !== "undefined") {
                finalMessages.push(message);
            }
        }
    return finalMessages;
}
}
