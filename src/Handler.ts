import { MatchableRoute } from './MatchableRoute';
import { ApplicationResponse, PathParameterValidator, RouterRequest } from './types';
import { UrlPathComponents } from './UrlPathComponents';

export class Handler<Validators extends { [key: string]: PathParameterValidator }> {
    public constructor(
        private matchableRoute: MatchableRoute<Validators>,
        private handle: (
            request: RouterRequest,
            parameters: { [K in keyof Validators]: ReturnType<Validators[K]> },
        ) => ApplicationResponse | Promise<ApplicationResponse>,
    ) {}

    public isMatching(request: RouterRequest, path: UrlPathComponents): boolean {
        return this.matchableRoute.isMethodAndPathMatching(request.method, path);
    }

    public async handleRequest(
        request: RouterRequest,
        path: UrlPathComponents,
    ): Promise<ApplicationResponse> {
        const parameters = this.matchableRoute.getParameters(path);

        return await this.handle(request, parameters);
    }
}
