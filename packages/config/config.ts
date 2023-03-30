import type { ITournamentConfig } from "./config.interface";

// export const config: ITournamentConfig = {
//     "host": "/r/osuplace",
//     "name": "/r/osuplace",
//     "discord": {
//         "guildId": "297657542572507137",
//         "auditChannelId": "1086005953469620345",
//         "ownerId": "188597497294225408",
//         "verifiedRoles": [
//             {
//                 "id": "1086007415507525764",
//                 "name": "Verified"
//             }
//         ],
//         "manualRoles": [
//             {
//                 "id": "1089944267738325034",
//                 "name": "failed-to-auto-verify"
//             },
//         ],
//         "preVerifiedRoles": [
//             "297658078395105280",
//             "958292223642988575",
//         ]
//     }
// }

export const config: ITournamentConfig = {
    "host": "/r/osuplace",
    "name": "/r/osuplace",
    "discord": {
        "guildId": "297657542572507137",
        "auditChannelId": "1086005953469620345",
        "ownerId": "188597497294225408",
        "verifiedRoles": [
            {
                "id": "1086007415507525764",
                "name": "Verified"
            }
        ],
        "manualRoles": [
            {
                "id": "1089944267738325034",
                "name": "failed-to-auto-verify"
            },
        ],
        "preVerifiedRoles": [
            "297658078395105280",
            "958292223642988575",
        ]
    }
}
