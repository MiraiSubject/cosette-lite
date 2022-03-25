import { Request, Response, Router } from "express";
import { autoInjectable, singleton } from "tsyringe";
import Configuration from "../Configuration";

@singleton()
@autoInjectable()
export default class ApiRouting {
    public readonly router: Router = Router();
    public dbConnected = false;
    public configPath = '';
    private tournament: Configuration;
    private roles: string[] = [];

    constructor(config?: Configuration) {
        this.addRoutes();
        if (config === undefined)
            throw new Error("Configuration file not injected");
        this.tournament = config;
        this.tournament.config.discord.roles.forEach(role => {
            this.roles.push(role.name);
        });
    }

    private addRoutes() {
        this.router.get('/tournament', async (req: Request, res: Response) => {
            const t = this.tournament.config;

            if (t === null)
                return res.status(404).send("Tournament not found");

            const { host, name } = t;
            return res.send({ host, name })
        });

        this.router.get('/discord-roles', async (req: Request, res: Response) => {
            res.send(this.roles);
        })
    }
}
