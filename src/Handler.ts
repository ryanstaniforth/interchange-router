import { MatchableRoute } from './MatchableRoute';
import { Request } from './Request';
import { PathParameterValidator, Response } from './types';
import { UrlPathComponents } from './UrlPathComponents';

export class Handler<Validators extends { [key: string]: PathParameterValidator }> {
    public constructor(
        private matchableRoute: MatchableRoute<Validators>,
        private handle: (
            request: Request,
            parameters: { [K in keyof Validators]: ReturnType<Validators[K]> },
        ) => Response | Promise<Response>,
    ) {}

    public isMatching(request: Request, path: UrlPathComponents): boolean {
        return this.matchableRoute.isMethodAndPathMatching(request.method, path);
    }

    public async handleRequest(request: Request, path: UrlPathComponents): Promise<Response> {
        const parameters = this.matchableRoute.getParameters(path);

        return await this.handle(request, parameters);
    }
}
