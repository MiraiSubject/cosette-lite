import {
  Client,
  GatewayIntentBits,
  Guild,
  GuildMember,
  Partials,
  TextChannel,
} from "discord.js";
import { config, ITournamentConfig, ITournamentRole } from "config";

export default class DiscordBot extends Client {
  private tourneyConfig = config;

  constructor() {
    super({
      intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
      partials: [Partials.User],
    });

    this.login(process.env.DISCORD_BOT_TOKEN);

    this.on("userVerified", async (guild: Guild, member: GuildMember) => {});
  }

  private async findGuildMember(guildId: string, userId: string) {
    const guild = this.guilds.cache.get(guildId);

    if (guild === undefined)
      throw new Error(
        "Invalid guild. Bot is likely not joined to the correct guild."
      );

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

  private async memberHasAnyRole(
    guildId: string,
    userId: string,
    roles: string[]
  ): Promise<boolean> {
    try {
      const guildMember = await this.findGuildMember(guildId, userId);
      return roles.some((roleId) => !!guildMember.roles.resolve(roleId));
    } catch (e) {
      return false;
    }
  }

  public async preVerified(guildId: string, userId: string) {
    return await this.memberHasAnyRole(
      guildId,
      userId,
      this.tourneyConfig.discord.preVerifiedRoles
    );
  }

  public async guildMemberExists(
    guildId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const guildMember = await this.findGuildMember(guildId, userId);
      if (guildMember !== null) return true;
      else return false;
    } catch (e) {
      // console.error(e);
      return false;
    }
  }

  private async giveRoles(roles: ITournamentRole[], guildMember: GuildMember) {
    try {
      console.log(
        `Adding roles: ${roles.map((info) => `"${info.name}"`).join(", ")} to ${
          guildMember.nickname
        }...`
      );
      guildMember.roles.add(roles.map((info) => info.id));
    } catch (e) {
      console.error(
        `Failed to add some roles to ${guildMember.nickname}.\nReason: ${e}`
      );
    }
  }

  public async setupVerified(userId: string, nickname: string, {osu_url, reddit_url}: {osu_url: string, reddit_url: string}) {
    try {
      const guildMember = await this.findGuildMember(
        this.tourneyConfig.discord.guildId,
        userId
      );

      await guildMember.setNickname(
        nickname,
        "Changed nickname to osu! username"
      );
      console.log(`Added ${nickname} nickname to ${userId}.`);

      this.giveRoles(config.discord.manualRoles, guildMember);

      const channelId = this.tourneyConfig.discord.auditChannelId;
      const auditChannel = guildMember.guild.channels.cache.get(channelId) as TextChannel;
      auditChannel.send(`<@${userId}> verified as ${osu_url} ${reddit_url}`)

    } catch (e) {
      console.error(e);
    }
  }

  public async setupManual(userId: string, {osu_url, reddit_url}: {osu_url: string, reddit_url: string}) {
    try {
      const guildMember = await this.findGuildMember(
        this.tourneyConfig.discord.guildId,
        userId
      );

      
      this.giveRoles(config.discord.manualRoles, guildMember);
      console.log(`Added manual verification role to ${userId}.`);

      // maybe send a message in manual verification chat???

    } catch (e) {
      console.error(e);
    }
  }
}
