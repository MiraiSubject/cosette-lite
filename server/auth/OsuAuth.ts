import passport from "passport";
import OsuStrategy from "passport-osu";
import { injectable } from "tsyringe";
import { AuthenticationClient } from "./AuthenticationClient";
import consola from "consola";
import { Request } from 'express';
import { IUser } from "./IUser";

@injectable()
export class OsuAuthentication extends AuthenticationClient {
    protected clientID: string = process.env.OSU2_CLIENT_ID || '';
    protected clientSecret: string = process.env.OSU2_CLIENT_SECRET || '';
    protected callbackURL: string = process.env.OSU2_CALLBACK_URL || '';
    RootURL = "/osu";

    constructor() {
        super();

        if (!this.VarsPresent())
            return;

        consola.info("Setting up osu! authentication routes...")

        passport.use(new OsuStrategy({
            type: 'StrategyOptionsWithRequest',
            clientID: this.clientID,
            clientSecret: this.clientSecret,
            callbackURL: this.callbackURL,
            passReqToCallback: true,
        }, (req: Request, _accessToken: string, _refreshToken: string, profile: any, cb: any) => {
            if (!req.user) {
                const o: IUser = {
                    discord: {},
                    osu: {
                        id: profile.id,
                        displayName: profile.displayName,
                        token: profile.token
                    }
                }

                return cb(null, o);
            } else {
                if (req.user === null)
                    return cb(new Error("User in request is null"), null);

                const o: IUser = req.user as any;

                o.osu.id = profile.id;
                o.osu.displayName = profile.displayName;

                return cb(null, o);
            }
        }));

        this.AddRoutes("osu", '/discord-check');

        consola.success("osu! authentication routes are registered.")
    }
}
