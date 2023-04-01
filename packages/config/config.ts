import type { OsuUser } from "../../apps/webstack/src/lib/OsuUser";
import type { ITournamentConfig } from "./config.interface";
import { DateTime } from "luxon";

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

/**
    * @description This function is used to check if the user is eligible for the verified role(s) specfied in your config.
    * The default is to check if the user is older than 6 months.
    * You can modify the function to check for other things, such as if the user has a certain amount of playtime, rank or pp.
    * @param userData The osu! profile of the user.
    * @returns A boolean indicating if the user is eligible for the linked role.
    * 
*/
export function isUserEligible(userData: OsuUser): boolean {
    const joinDate = DateTime.fromISO(userData.join_date);
    const nowMinus6Months = DateTime.now().minus({ months: 6 });

    return nowMinus6Months > joinDate;
}