export interface ITournamentRole {
    id: string;
    name: string;
}

export interface ITournamentConfig {
    name: string;
    host: string;
    discord: {
        guildId: string;
        auditChannelId: string;
        ownerId: string;
        verifiedRoles: ITournamentRole[];
        manualRoles: ITournamentRole[];
        preVerifiedRoles: string[];
    }
}