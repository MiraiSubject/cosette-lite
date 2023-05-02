import type { OsuUser } from "../../apps/webstack/src/lib/OsuUser";
import type { ITournamentConfig } from "./config.interface";
import { DateTime } from "luxon";

export const config: ITournamentConfig = {
    "host": "Mirai Subject",
    "name": "osu! Tournament Hub",
    "discord": {
        "guildId": "315235342447935491",
        "welcomeChannelId": "931251476297297930",
        "ownerId": "119142790537019392",
        "roles": [
            {
                "id": "315242280019689484",
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