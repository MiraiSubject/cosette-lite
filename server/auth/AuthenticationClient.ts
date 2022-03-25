import { NextFunction, Request, Response, Router } from "express";
import consola from "consola";
import passport from "passport";

export abstract class AuthenticationClient {
    public readonly router: Router = Router();
    protected abstract RootURL: string;
    protected abstract clientID: string;
    protected abstract clientSecret: string;
    protected abstract callbackURL: string;

    protected VarsPresent(): boolean {
        if (this.StrIsEmpty(this.clientID) || this.StrIsEmpty(this.clientSecret) || this.StrIsEmpty(this.callbackURL)) {
            consola.error(`Necessary information missing to enable ${this.ClassOf(this)}. Disabling...`);
            return false;
        }
        return true;
    }

    protected StrIsEmpty(str: string): boolean {
        return str === '' || str === undefined;
    }

    protected middleWare(req: Request, res: Response, next: NextFunction): void {
        next();
    }

    protected callbackMiddleWare(req: Request, res: Response, next: NextFunction): void {
        next();
    }

    protected AddRoutes(strategyName: string): void {
        this.router.get("/", this.middleWare, passport.authenticate(strategyName));
        this.router.get("/cb", passport.authenticate(strategyName, { failureRedirect: '/'}), this.callbackMiddleWare);
    }

    private ClassOf<T extends AuthenticationClient>(c: T): string {
        return c.constructor.name;
    }
}
