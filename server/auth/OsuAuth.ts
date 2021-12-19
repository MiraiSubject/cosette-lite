import passport from "passport";
import OsuStrategy, { PassportProfile } from "passport-osu";
import { injectable } from "tsyringe";
import { AuthenticationClient } from "./AuthenticationClient";
import consola from "consola";
import { NextFunction, Request, Response } from 'express';
import { IUser } from "./IUser";
import { DateTime } from "luxon";

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
        }, (req: Request, _accessToken: string, _refreshToken: string, profile: PassportProfile, cb: any) => {
            if (!req.user) {
                const o: IUser = {
                    discord: {},
                    osu: {
                        id: `${profile.id}`,
                        displayName: profile.displayName,
                        token: _accessToken,
                        joinDate: DateTime.fromISO(profile._json.join_date)
                    }
                }

                return cb(null, o);
            } else {
                if (req.user === null)
                    return cb(new Error("User in request is null"), null);

                const o: IUser = req.user as any;

                o.osu.id = `${profile.id}`;
                o.osu.token = _accessToken;
                o.osu.displayName = profile.displayName;
                o.osu.joinDate = DateTime.fromISO(profile._json.join_date);

                return cb(null, o);
            }
        }));

        this.AddRoutes("osu", '/discord-check');

        consola.success("osu! authentication routes are registered.")
    }

    protected callbackMiddleWare(req: Request, res: Response, next: NextFunction): void {
        const now = DateTime.now().minus({ months: 6 });
        const u = req.user as IUser;
        const userJoinDate = u.osu.joinDate!
        console.log(now, userJoinDate);
        if (now > userJoinDate) {
            res.redirect('/checks/discord');
        } else {
            consola.info(`${u.osu.displayName} joined on ${userJoinDate} needs manual verification.`)
            res.redirect('/checks/manual');
        }
    }
}
