# Tournament verification system

This Nuxt.js + Express backend was made for the verification of the osu! tournament hub discord server. 

I put this repo mostly out for transparency of what's happening behind the scenes when a user verifies themselves, but this could be adapted for your own discord server too. 

Most of the code should be self-explanatory, but if parts aren't feel free to hit me up in the tournament hub discord, or open an issue here.

## Requirements
- Node.js (LTS, minimum 16.13.1)
- yarn
- Optionally:
    - Docker
- Redis (for session caching, included in docker-compose definition file)
- Domain name (if deploying to a server)
- Self-signed SSL certficate (if developing with https locally)

## Configuration

### Environment
- [Discord account & an OAuth2 application and bot](https://discord.com/developers/applications)
    - Information you need:
        - Discord OAuth2 Client ID (`DISCORD_CLIENT_ID`)
        - Discord OAuth2 Client Secret (`DISCORD_CLIENT_SCRET`)
        - Discord Bot Token (`DISCORD_BOT_TOKEN`)
            - Server Member intent must be enabled too
- [osu! account & an OAuth2 application](https://osu.ppy.sh/home/account/edit) Scroll down to the "OAuth" section and create your app. 
    - Information you need:
        - Client ID (`OSU2_CLIENT_ID`)
        - Client Secret (`OSU2_CLIENT_SECRET`)

Both these OAuth2 providers will request a callback URL in their forms. When developing locally you will need to add the following callback URLs for Discord and osu! respectively:
- http://localhost:8000/auth/discord/cb (`DISCORD_CALLBACK_URL`)
- http://localhost:8000/auth/osu/cb (`OSU2_CALLBACK_URL`)

If you intend to deploy for usage on a domain then you will need to use:
- https://example.com/auth/discord/cb (`DISCORD_CALLBACK_URL`)
- https://example.com/auth/osu/cb (`OSU2_CALLBACK_URL`)

In a production environment it's highly recommended to put this behind a reverse proxy like nginx, caddy, or traefik.

`COOKIE_SECURE` defines whether the cookie will only be available on https or http too. (0 = http, for development purposes only, 1 = https only).

`COOKIE_SECRET` is the secret you provide for the cookie. Make sure this is something unique and stays consistent when deployed to production. [Refer to this SO post for more information](https://stackoverflow.com/questions/47105436/how-and-when-do-i-generate-a-node-express-cookie-secret)

`REDIS_HOST` & `REDIS_PORT` is the location where the redis instance is located. By default these are 127.0.0.1 and 6379 (default redis port). **If you're using the docker-compose from this repo you will only need to fill in `REDIS_HOST` with value `redis`.**

`DOMAIN_URL` is for when running behind a docker container and API can't be called via localhost on default port. Leave empty if doesn't apply.

Refer to the `.env.example` file for these and other variables that may be needed. (Don't forget to rename it to `.env` to be able to use it)

### Tournament

Rename the `config.example.json` file to `config.json`. Then fill in the file based on the example or use following example based on a hypothetical tournament: 

```json
{
    "name": "Mirai Tournament 2021",
    "host": "Mirai Subject",
    "discord": {
        "guildId": "336524457143304196",
        "welcomeChannelId": "336524751860138005",
        "ownerId": "119142790537019392",
        "roles": [
            {
                "id":"352505182854316036",
                "name": "Verified" 
            }
        ]
    },
    "domains": ["mirai2021.example.com"],
    "dev": {
        "https": false
    }
}
```

## Developing

Install dependencies:
`yarn install `

Develop with HMR:
`yarn dev`

To test production locally do `yarn build` and then `yarn start` to start a production server locally.

## Deploying to production

There is a `Dockerfile` present and a `docker-compose` file that can be used in a live environment. 

If building on an ARM based system and deploy to Intel/AMD-based systems you will need to use something like:

`docker buildx build --platform linux/amd64 --tag oth-verification .`

to build it for the correct architecture. [Refer to the Docker documentation for more information](https://docs.docker.com/buildx/working-with-buildx/). Obviously don't use this command if you're already building on an Intel/AMD-based system and intend to deploy on another Intel/AMD-based system.