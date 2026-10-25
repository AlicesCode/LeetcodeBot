const { TextDisplayBuilder, FileBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const fs = require('node:fs/promises');

module.exports = {
    version: '00b',
    app: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.APP_ID,
        publicKey: process.env.PUBLIC_KEY,
    },
    dev: {
        guildId: process.env.GUILD_ID,
        logChannelId: process.env.LOG_CHANNEL_ID,
        backupPath: 'data/backup.json'
    },
    settings: {
        echoChannels: {},
        guilds: {}
    },
    streaks: {
        guilds: {
            "1558654694891589724": {
                "981325709706403850": {
                    alias: "snek",
                    streak: 0,
                    hasSubmitted: false
                },
                "730152260872568965": {
                    alias: "alice",
                    streak: 0,
                    hasSubmitted: false
                }
            },
        }
    },
    volatile: {
        client: null,
        logChannel: null,
        guilds: {}
    },
    async init(client) {
        // load volatile static objects
        this.volatile.client = client;
        this.volatile.logChannel = await client.channels.fetch(this.dev.logChannelId);
        
        // load old data
        const oldData = JSON.parse((await fs.readFile(this.dev.backupPath)).toString('utf8'));
        if (oldData.version == this.version) {
            this.settings = oldData.data;
        } else {
            this.log(`[WARN] version \`${oldData.version}\` doesn't match \`${this.version}\`!!`);
            await this.volatile.logChannel.send({
                components: [
                    new TextDisplayBuilder().setContent("Here's what was overriden, just in case!"),
                    new FileBuilder().setURL('attachment://backup.json'),
                ],
                files: [ new AttachmentBuilder(this.dev.backupPath) ],
                flags: MessageFlags.IsComponentsV2,
            })
        }
        
        // load volatile guild channels
        for (const guildID in this.settings.guilds) {
            console.log(guildID)
            this.volatile.guilds[guildID] = {
                discussionChannel: await client.channels.fetch(this.settings.guilds[guildID].discussion)
            };
        }
        
        // finish
        console.log("initialized config!")
        this.log({
            user: client.user,
            action: "connected!"
        });
        console.log(this.settings)
    },
    async backup() {
        let backup = {
            name: this.volatile.client.user.username,
            time: Date.now(),
            version: this.version,
            data: this.settings,
        }
        await fs.writeFile(this.dev.backupPath, JSON.stringify(backup));
        // await this.volatile.logChannel.send({
        //     components: [
        //         new TextDisplayBuilder().setContent("Here's a backup!"),
        //         new FileBuilder().setURL('attachment://backup.json'),
        //     ],
        //     files: [ new AttachmentBuilder(this.dev.backupPath) ],
        //     flags: MessageFlags.IsComponentsV2,
        // })
    },
    async log(arg) {
        if (typeof arg === "string") {
            await this.volatile.logChannel.send(arg);
        } else {
            const {channel, user, action} = arg;
            if (channel === undefined) {
                await this.volatile.logChannel.send(`<@${user.id}> ${action}`)
            } else {
                await this.volatile.logChannel.send(`<@${user.id}> ${action} in <#${channel.id}>`)
            }
        }
    },
    isSubmission(message) {
        return this.settings.guilds[message.guildId]?.forum === message.channel.parentId &&
            (message.content.includes("```") || message.attachments.size > 0);
    }
}