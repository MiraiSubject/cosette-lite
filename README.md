# osu! tournament hub verification system

This Nuxt.js + Express backend was made for the verification of the osu! tournament hub discord server. 

I put this repo mostly out for transparency of what's happening behind the scenes when a user verifies themselves, but this could be adapted for your own discord server too. 

Most of the code should be self-explanatory, but if parts aren't feel free to hit me up in the tournament hub discord, or open an issue here.

## Requirements
- Node.js (LTS)
- yarn
- Optionally:
    - Docker
- Redis (for session caching)

## Developing

Install dependencies:
`yarn install `

Develop with HMR:
`yarn dev`

## Deploying to production

There is a `Dockerfile` present and a `docker-compose` file that can be used in a live environment. 

If building on an ARM based system and deploy to Intel/AMD-based systems you will need to use something like:

`docker buildx build --platform linux/amd64 --tag oth-verification .`

to build it for the correct architecture. [Refer to the Docker documentation for more information](https://docs.docker.com/buildx/working-with-buildx/)