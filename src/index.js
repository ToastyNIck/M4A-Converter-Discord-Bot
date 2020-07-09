const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const fetch = require('node-fetch');
const { createWriteStream, createReadStream, unlink } = require('fs');
const { pipeline } = require('stream');
const { join } = require('path');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if (msg.author.bot) return;
    const attachments = msg.attachments.array().filter(a => a.name.endsWith('.m4a'));
    if (attachments.length < 1) return;
    for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        const response = await fetch(attachments[0].url)
        if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
        const filePath = `./tmp/${(Date.now() * Math.random()).toString(36)}.m4a`;
        await new Promise((res, rej) => {
            const writeStream = createWriteStream(filePath);
            pipeline(response.body, writeStream, (err) => {
                if (err) rej(err);
                res();
            });
        });


        msg.channel.send('converted', {
            files: [{
                attachment: await m4aToMp3(filePath),
                name: attachment.name.slice(0, attachment.name.length - 3) + 'mp3'
            }]
        });
        unlink(filePath);
    }


    /*
    msg.channel.send(`converted ${attachments.size} files`, {
        files: await Promise.all(attachments.map(async v => {

        }))
    });*/
});


 let prefix = "~";
client.on("message", (message) => {
  if (message.author.id === client.user.id) return;
  let args = message.content.split(" ").slice(1);
  if (message.content.startsWith(prefix + "Credits")) {
    message.channel.send("Coded by CHY4E#0505");
  }

client.login(config.discordtoken);



function m4aToMp3(inputfile) {
    return new Promise((res, rej) => {
        const child = spawn(ffmpegPath, ['-i', `${inputfile}`, '-acodec', 'libmp3lame', '-aq', '2', '-ab', '192k', '-f', 'mp3', 'pipe:1']);
        child.stdout.once('readable', () => res(child.stdout));
        child.once('error', rej);
        child.stderr.on('data', e => console.log(e.toString()))
    });

}
