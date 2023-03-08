# Tournament verification system

This Nuxt.js + Express backend was made for the verification of the osu! tournament hub discord server. 

I put this repo mostly out for transparency of what's happening behind the scenes when a user verifies themselves, but this could be adapted for your own discord server too. 

Most of the code should be self-explanatory, but if parts aren't feel free to hit me up in the tournament hub discord, or open an issue here.

## Requirements
- Node.js (LTS, minimum 18.13.0)
- pnpm
- Optionally:
    - Docker
- Redis (for session caching, included in docker-compose definition file)
- Domain name (if deploying to a server)
- Self-signed SSL certficate (if developing with https locally)

## Configuration

### Environment

Rename `.env.example` to `.env` and fill in the following information:

- [Discord account & an OAuth2 application and bot](https://discord.com/developers/applications)
  - Discord OAuth2 Client ID (`PUBLIC_DISCORD_CLIENT_ID`)
  - Discord OAuth2 Client Secret (`DISCORD_CLIENT_SECRET`)
  - Discord Bot Token (`DISCORD_BOT_TOKEN`)
      - Server Member intent must be enabled too
- [osu! account & an OAuth2 application](https://osu.ppy.sh/home/account/edit) Scroll down to the "OAuth" section and create your app. 
    - Information you need:
        - Client ID (`PUBLIC_OSU2_CLIENT_ID`)
        - Client Secret (`OSU2_CLIENT_SECRET`)

Both these OAuth2 providers will request a callback URL in their forms. When developing locally you will need to add the following callback URLs for Discord and osu! respectively:
- http://localhost:8000/auth/discord/callback (`PUBLIC_DISCORD_CALLBACK_URL`)
- http://localhost:8000/auth/osu/callback (`PUBLIC_OSU2_CALLBACK_URL`)

If you intend to deploy for usage on a domain then you will need to use:
- https://example.com/auth/discord/callback (`PUBLIC_DISCORD_CALLBACK_URL`)
- https://example.com/auth/osu/callback (`PUBLIC_OSU2_CALLBACK_URL`)

In a production environment it's highly recommended to put this behind a reverse proxy like [nginx](https://nginx.org/en/), [caddy](https://caddyserver.com/), or [traefik](https://traefik.io/).

`COOKIE_SECRET` is the secret you provide for the cookie. Make sure this is something unique and stays consistent when deployed to production. [Refer to this SO post for more information](https://stackoverflow.com/questions/47105436/how-and-when-do-i-generate-a-node-express-cookie-secret)

### Tournament

Go to `packages/config/config.ts` 

```ts
import type { ITournamentConfig } from "./config.interface";

export const config: ITournamentConfig = {
    "host": "Mirai Tournament 2021",
    "name": "Mirai Subject",
    "discord": {
        "guildId": "336524457143304196",
        "welcomeChannelId": "336524751860138005",
        "ownerId": "119142790537019392",
        "roles": [
            {
                "id": "352505182854316036",
                "name": "Verified"
            }
        ]
    }
}
```

## Developing

Install dependencies:
`pnpm install `

Develop with HMR:
`pnpm dev`

To test production locally do `pnpm build` and then `pnpm start` to start a production server locally.

## Deploying to production

There is a `Dockerfile` present and a `docker-compose` file that can be used in a live environment.

If building on an ARM based system and deploy to Intel/AMD-based systems you will need to use something like:

`docker build --platform linux/amd64 --tag oth-verification .`

to build it for the correct architecture. [Refer to the Docker documentation for more information](https://docs.docker.com/buildx/working-with-buildx/). Obviously don't use this command if you're already building on an Intel/AMD-based system and intend to deploy on another Intel/AMD-based system.