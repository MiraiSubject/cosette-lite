export enum BotResult {
    Success,
    Error,
    Full
}

export interface DiscordData {
    application: Application;
    scopes: string[];
    expires: string;
    user: DiscordOAuth2User;
}
interface Application {
    id: string;
    name: string;
    icon: string;
    description: string;
    hook: boolean;
    bot_public: boolean;
    bot_require_code_grant: boolean;
    verify_key: string;
}
export interface DiscordOAuth2User {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
}
export interface DiscordErrorResponse {
    code: number;
    message: string;
}
