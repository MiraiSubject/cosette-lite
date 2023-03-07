import type { ITournamentConfig } from "./config.interface";

export const config: ITournamentConfig = {
    "host": "Example Host",
    "name": "Example tournament name",
    "discord": {
        "guildId": "insert discord guild id here",
        "welcomeChannelId": "insert channel id for welcome messages",
        "ownerId": "id of guild owner",
        "roles": [
            {
                "id": "roleId",
                "name": "Verified"
            }
        ]
    }
}
