import { Client, GatewayIntentBits, Guild, GuildMember, Partials, TextChannel } from 'discord.js';
import { config } from "config";

export default class DiscordBot extends Client {
    private tourneyConfig = config;

    constructor() {
        super({ intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds], partials: [Partials.User] });

        this.login(process.env.DISCORD_BOT_TOKEN);

        this.on('userVerified', async (guild: Guild, member: GuildMember) => {
            try {

                const channelId = this.tourneyConfig.discord.welcomeChannelId;
                const channel = guild.channels.cache.get(channelId) as TextChannel;

                channel.send(`Welcome ${member} you are now verified!`)
            } catch (e) {
                console.error(e);
            }
        });

    }

    private async findGuildMember(guildId: string, userId: string) {
        const guild = this.guilds.cache.get(guildId);

        if (guild === undefined)
            throw new Error("Invalid guild. Bot is likely not joined to the correct guild.");

        let guildMember = guild.members.cache.get(userId);
        
        if (guildMember === undefined) {
            await guild.members.fetch();
            guildMember = guild.members.cache.get(userId);
        }

        if (guildMember === undefined) {
            console.log(`Guild member ${userId} not found, moving on...`);
            throw new Error("Member not found!");
        }

        return guildMember;
    }

    public async guildMemberExists(guildId: string, userId: string): Promise<boolean> {
        try {
            const guildMember = await this.findGuildMember(guildId, userId);
            if (guildMember !== null)
                return true;
            else
                return false;
        } catch (e) {
            // console.error(e);
            return false;
        }
    }

    private async changeNickName(nickname: string, member: GuildMember) {
        try {
            await member.setNickname(nickname, "Changed nickname to osu! username");
        } catch (e) {
            // We will silence this error to the parent function running this so it can continue.
            console.error(e);
        }
    }

    public async setUpUser(userId: string, nickname: string): Promise<void> {
        try {
            const guildMember = await this.findGuildMember(this.tourneyConfig.discord.guildId, userId);

            await this.changeNickName(nickname, guildMember);
            console.log(`Added ${nickname} nickname to ${userId}.`)

            const roles = this.tourneyConfig.discord.roles;
            const arr: string[] = [];

            roles.forEach(role => {
                arr.push(role.id);
            })
            guildMember.roles.cache.forEach(role => {
                arr.push(role.id);
            });

            console.log(`Adding ${arr} roles to ${nickname}...`);

            for (let i = 0; i < arr.length; i++) {
                try {
                    console.log(`Adding ${arr[i]} to ${nickname}...`);
                    guildMember.roles.add(arr);
                } catch (e) {
                    console.error(`Failed to add ${arr[i]} to ${nickname}.\nReason: ${e}`)
                }
            }

            this.emit('userVerified', guildMember.guild, guildMember);

        } catch (e) {
            console.error(e);
        }
    }
}