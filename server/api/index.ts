import { Router, Request, Response } from "express";
import { autoInjectable, inject, singleton } from "tsyringe";
import Configuration from "../Configuration";

@singleton()
@autoInjectable()
export default class ApiRouting {
    public readonly router: Router = Router();
    public dbConnected: boolean = false;
    public configPath: string = '';
    private tournament: Configuration;

    constructor(config?: Configuration) {
        this.addRoutes();
        if (config === undefined)
            throw new Error("Configuration file not injected");
        this.tournament = config;
    }

    private addRoutes() {
        this.router.get('/tournament', async (req: Request, res: Response) => {
            const t = this.tournament.config;

            if (t === null)
                return res.status(404).send("Tournament not found");

            const { host, name } = t;
            return res.send({ host, name })
        });
    }
}
