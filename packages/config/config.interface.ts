export interface ITournamentRole {
    id: string;
    name: string;
}

export interface ITournamentConfig {
    name: string;
    host: string;
    discord: {
        guildId: string;
        welcomeChannelId: string;
        ownerId: string;
        roles: ITournamentRole[];
        preVerifiedRoles: string[];
    }
}