export interface ITournamentConfig {
    name: string;
    host: string;
    discord: {
        guildId: string;
        welcomeChannelId: string;
        ownerId: string;
        roles: ITournamentRole[];
    }
    domains: string[];
    dev: {
        https: boolean
    }
}
export interface ITournamentRole {
    id: string;
    name: string;
}