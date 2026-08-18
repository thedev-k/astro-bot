const axios = require("axios");
require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true
});


app.command("/astro-bot-apod", async ({ ack, respond }) => {
    await ack();

    try {
        const response = await axios.get("https://api.nasa.gov/planetary/apod", {
            params: {
                api_key: process.env.NASA_API_KEY,
                date: new Date().toISOString().split('T')[0]
            }
        });

        const { title, explanation, url, date } = response.data;

        await respond({
            text: `🌌 *Astronomy Picture of the Day*`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*${title}*\n_${date}_\n\n${explanation.substring(0, 300)}...\n\n<${url}|View Full Image>`
                    }
                }
            ]
        });
    } catch (err) {
        console.error("APOD error:", err);
        await respond({
            text: "Failed to fetch today's astronomy picture."
        });
    }
});

app.command("/astro-bot-iss", async ({ ack, respond }) => {
    await ack();

    try {
        const response = await axios.get("http://api.open-notify.org/iss-now.json");

        const { latitude, longitude } = response.data.iss_position;
        const timestamp = response.data.timestamp;

        const mapsUrl = `https://www.google.com/maps/search/${latitude},${longitude}`;
        const time = new Date(timestamp * 1000).toLocaleString();

        await respond({
            text: `🛰️ *International Space Station (ISS) Location*`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Current Position (as of ${time}):*\nLatitude: ${parseFloat(latitude).toFixed(4)}°\nLongitude: ${parseFloat(longitude).toFixed(4)}°\n\n<${mapsUrl}|View on Google Maps>`
                    }
                }
            ]
        });
    } catch (err) {
        console.error("ISS error:", err);
        await respond({
            text: "Failed to fetch ISS location. Try again later!"
        });
    }
});


app.command("/astro-bot-catfact", async ({ ack, respond }) => {
    await ack();
    try {
        const response = await axios.get("https://catfact.ninja/fact");
        await respond({ text: `Cat Fact:\n${response.data.fact}` });
    } catch (err) {
        await respond({ text: "Failed to fetch a cat fact." });
    }
});


app.command("/astro-bot-ping", async ({ command, ack, respond }) => {
    const start = Date.now();
    await ack();
    const latency = Date.now() - start;
    await respond({ text: `Pong!\nLatency: ${latency}ms` });
});


app.command("/astro-bot-help", async ({ ack, respond }) => {
    await ack();
    await respond({
        text:
            `Available Commands:
/astro-bot-ping - Check bot latency
/astro-bot-apod - Get today's astronomy picture
/astro-bot-iss - Current ISS location
/astro-bot-catfact - Get a cat fact`
    });
});


(async () => {
    await app.start();
    console.log("bot is running!");
})();