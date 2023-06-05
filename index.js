const { Client } = require(`discord.js-selfbot-v13`);
const { Configuration, OpenAIApi } = require("openai");
const cooldowns = new Map();
require("dotenv").config();
const client = new Client({
  checkUpdate: false,
});
const time = process.env.cooldown;

client.on(`ready`, () => {
  console.log(`Logged in as ${client.user.tag}.`);
});

const configuration = new Configuration({
  apiKey: process.env.api,
});
const openai = new OpenAIApi(configuration);

client.on(`messageCreate`, async (message) => {

    // Limit the bot to a limited amount of channels. This is to prevent the bot from replying to every message in every channel.
    // If you want to add more channels, just copy and paste the line below and change the channel id. Make sure to add a comma after the previous channel id.

  const channels = [
    "channel id",
  ]

  // Remove the "//" from the line below to enable the channel limit. It is disabled by default. You can enable it by adding a "//" to the beginning of the line.

//if (message.channel.id !== channels) return;

  if (message.author.bot) return;
  if (message.author.id === client.user.id) return;
  if (cooldowns.has(message.author.id)) return;

  const prompt = `You are ${client.user.username}.` + process.env.prompt;

  try {
    const res = await openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 100,
      temperature: 0.6,
      prompt: prompt + "human:" + message.content + "\nAI:",
    });

    const aiText = res.data.choices[0].text.trim();

    cooldowns.set(message.author.id, Date.now());

    setTimeout(() => {
      cooldowns.delete(message.author.id);
    }, time);

    return await message.reply(aiText);
  } catch (err) {
    console.error(err.response);
  }
});

client.login(process.env.token);