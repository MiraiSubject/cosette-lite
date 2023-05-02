# Cosette Lite

This is a full-stack application built using [SvelteKit](https://kit.svelte.dev) and [Fastify](https://www.fastify.io). It was originally made for the verification of the osu! tournament hub discord server. 

It is relatively easy to adapt for your own tournament and discord server, with minimum modifications. Some basic knowledge of Typescript, Svelte and Docker may be required to successfully deploy an instance of this projetc.

Most of the code should be self-explanatory, but if parts aren't feel free to hit me up in the tournament hub Discord, or open an issue here.

## Requirements
- *nix-based OS (macOS, Linux, WSL 2 on Windows) **Native Windows is not supported**
- Node.js (LTS, minimum 18.13.0)
- pnpm (I do not provide support for other package managers, this monorepo **requires** pnpm)
- Turbo (`pnpm add -g turbo`)
- Domain name (if deploying to a server)
- Optionally:
    - Docker

## Configuration

### Environment

Rename `.env.example` to `.env` and fill in the following information:

- [Discord account & an OAuth2 application and bot](https://discord.com/developers/applications)
  - Discord OAuth2 Client ID (`PUBLIC_DISCORD_CLIENT_ID`)
  - Discord OAuth2 Client Secret (`DISCORD_CLIENT_SECRET`)
  - Discord Bot Token (`DISCORD_BOT_TOKEN`)
      - Server Member intent must be enabled
      - Required permissions:
        - Manage Roles
        - Manage Nicknames
        - Create Invite
      - Example of an invite link with the right permissions: https://discord.com/api/oauth2/authorize?client_id=YOURBOTSAPPLICATIONID&permissions=402653185&scope=bot
- [osu! account & an OAuth2 application](https://osu.ppy.sh/home/account/edit) Scroll down to the "OAuth" section and create your app. 
    - Information you need:
        - Client ID (`PUBLIC_OSU2_CLIENT_ID`)
        - Client Secret (`OSU2_CLIENT_SECRET`)

Both these OAuth2 providers will request a callback URL in their forms. When developing locally you will need to add the following callback URLs for Discord and osu! respectively:
- http://localhost:8000/auth/discord/callback
- http://localhost:8000/auth/osu/callback

If you intend to deploy for usage on a domain (whether it's for development or locally) then you will need to use:
- https://example.com/auth/discord/callback
- https://example.com/auth/osu/callback
where example.com is your `PUBLIC_BASE_URL`

In a production environment it's highly recommended to put this behind a reverse proxy like [nginx](https://nginx.org/en/), [caddy](https://caddyserver.com/), or [traefik](https://traefik.io/). Using these proxies you can easily configure secure connections.

`COOKIE_SECRET` is the secret you provide for the cookie. Make sure this is something unique and stays consistent when deployed to production. [Refer to this SO post for more information](https://stackoverflow.com/questions/47105436/how-and-when-do-i-generate-a-node-express-cookie-secret)

### Customise the stack for your tournament.

Go to `packages/config/config.ts` and modify the fields accordingly: 

- Host: the host of the tournament, preferrably their osu! username for clarity. This can also be the owner of the Discord server if this is not a tournament.
- Name: the name of the tournament or Discord server
  
- Discord: You will need to enable developer mode in your Discord client to be able to fill these fields in.
  - guildId: the guild where people get joined to by the application
  - welcomeChannelId: the channel where the bot can send welcome messages to confirm a successful entry for the user.
  - ownerId: unused.
  - roles: a list of roles you want give to the user in the following format:
    ```json
    {
        "id": "role id from your client",
        "name": "Name of the role"
    }
    ```

Here's an example of a valid configuration: 

```ts
import type { ITournamentConfig } from "./config.interface";

export const config: ITournamentConfig = {
    "host": "Mirai Subject",
    "name": "Mirai Tournament 2021",
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

You can also modify the `isUserEligible` function to customise it according to your needs. The function just has to return a boolean for the condition where a user is eligible.

The default implementation that we use for verification on the osu! Tournament Hub: 
https://github.com/MiraiSubject/cosette-lite/blob/9ee4cb86f20debf4e2e7f86e9d52f5610408fe5e/packages/config/config.ts#L21-L34

**Note: By default the `OsuUser` in the parameter uses their favourite game mode.**

To modify it to use your desired game mode `./apps/webstack/src/routes/auth/osu/callback/+server.ts` [this file](https://github.com/MiraiSubject/cosette-lite/blob/master/apps/webstack/src/routes/auth/osu/callback/%2Bserver.ts) to match the game mode. 

Currently the valid modes according to the current osu! [API documentation](https://osu.ppy.sh/docs/index.html#gamemode) are:
- `fruits` for osu!catch
- `mania` for osu!mania
- `osu` for	osu!standard
- `taiko` for osu!taiko

Here is how you would modify the function to get the user's data for the appropriate game mode: 
```diff
async function getUserData(tokens: {
    access_token: string;
    token_type: string;
}) {
-   const url = 'https://osu.ppy.sh/api/v2/me';
+   const url = 'https://osu.ppy.sh/api/v2/me/osu';
// ...
}
```

## Developing

Install dependencies:
`pnpm install`

Develop with HMR:
`pnpm dev`

To test production locally do `pnpm build` and then `pnpm start` to start a production server locally.

## Deploying to production

Convenience scripts are present to build Docker images for both components of the repo (`build-bot.sh` & `build-web.sh`). There is also an example `docker-compose` file present.

If you're building on an ARM based system and intend to deploy to an Intel/AMD-based systems you will need to add `--platform linux/amd64` to the build command, for example:

`docker build --platform linux/amd64 --tag othbot .`

to build it for the correct architecture. [Refer to the Docker documentation for more information](https://docs.docker.com/build/building/multi-platform/). Obviously don't use this command if you're already building on an Intel/AMD-based system and intend to deploy on another Intel/AMD-based system.

## Migrating from vue2/nuxt-based oth-verification

If you only modified the `config.json` file then all you have to do is move the set configuration to the file in `packages/config/config.ts`.

Some important notes regarding the `config.json`:
- domains is removed: It's not required anymore for CORS, everything is internalised.
- dev, https is removed: It's not used anymore.

Important migration notes: 
- pnpm is now the chosen package manager due to the project becoming a monorepo with two components.
- turborepo (`turbo`) is now a requirement for the same aforementioned reason
- Native Windows is not supported anymore due to the usage of Unix Sockets for communication between the Discord bot and the web application.
  - Workaround: modify the fastify server to create an http server and point the web application to the same URLs. Make sure to properly configure your firewall and/or secure the endpoints if you're going this route.

Any custom modifications made in the Nuxt application will be lost and have to be rewritten using Svelte. Style modifications can easily be migrated if you only lightly modified your instance.

If for any reason you'd like to reference the old Nuxt version of this application you can do so [here](https://github.com/MiraiSubject/oth-verification/tree/nuxt-2).