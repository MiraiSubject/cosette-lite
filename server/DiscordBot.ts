import { Client, Guild, GuildMember, Intents, TextChannel } from 'discord.js';
import { autoInjectable, singleton } from 'tsyringe';
import Configuration from './Configuration';
import { ITournamentConfig } from './config.interface';
import consola from 'consola';

@singleton()
@autoInjectable()
export default class DiscordBot extends Client {
    private tourneyConfig: ITournamentConfig;
    constructor(config?: Configuration) {
        super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS], partials: ['USER'] });

        if (!config)
            throw new Error("Configuration file not successfully injected.");

        this.tourneyConfig = config.config;

        this.once('ready', () => {
            console.log(`o!th bot is ready`)
        });

        this.on('userVerified', async (guild: Guild, member: GuildMember) => {
            try {

                const channelId = this.tourneyConfig.discord.welcomeChannelId;
                const channel = guild.channels.cache.get(channelId) as TextChannel;

                channel.send(`Welcome ${member} you are now verified!`)
            } catch (e) {
                consola.error(e);
            }
        });

        this.login(process.env.DISCORD_BOT_TOKEN)
    }

    public async setUpUser(userId: string, nickname: string): Promise<void> {
        try {
            const guildMember = await this.findGuildMember(userId);

            await this.changeNickName(nickname, guildMember);
            consola.success(`Added ${nickname} nickname to ${userId}.`)

            const roles = this.tourneyConfig.discord.roles;
            const arr: string[] = [];

            roles.forEach(role => {
                arr.push(role.id);
            })
            guildMember.roles.cache.forEach(role => {
                arr.push(role.id);
            });

            consola.info(`Adding ${arr} roles to ${nickname}...`);

            for (let i = 0; i < arr.length; i++) {
                try {
                    consola.info(`Adding ${arr[i]} to ${nickname}...`);
                    guildMember.roles.add(arr);
                } catch (e) {
                    consola.error(`Failed to add ${arr[i]} to ${nickname}.\nReason: ${e}`)
                }
            }

            this.emit('userVerified', guildMember.guild, guildMember);

        } catch (e) {
            console.error(e);
        }
    }

    private async findGuildMember(userId: string) {
        const guild = this.guilds.cache.get(this.tourneyConfig.discord.guildId);

        if (guild === undefined)
            throw new Error("Invalid guild. Bot is likely not joined to the correct guild.");

        await guild.members.fetch();
        const guildMember = guild.members.cache.get(userId);

        if (guildMember === undefined) {
            consola.info(`Guild member ${userId} not found, moving on...`);
            throw new Error("Member not found!");
        }

        return guildMember;
    }

    public async guildMemberExists(userId: string): Promise<boolean> {
        try {
            const guildMember = await this.findGuildMember(userId);
            if (guildMember !== null)
                return true;
            else
                return false;
        } catch (e) {
            consola.error(e);
            return false;
        }
    }

    private async changeNickName(nickname: string, member: GuildMember) {
        try {
            await member.setNickname(nickname, "Changed nickname to osu! username");
        } catch (e) {
            // We will silence this error to the parent function running this so it can continue.
            consola.error(e);
        }
    }
}
