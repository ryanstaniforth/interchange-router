import { HandlerNotFoundError, MethodNotSupportedError } from './errors';
import { Handler } from './Handler';
import { Request } from './Request';
import { isMethod, RawRequest, Response } from './types';
import { UrlPathComponents } from './UrlPathComponents';

export class Router {
    private handlers: Array<Handler<any>> = [];

    public registerHandler(handler: Handler<any>): void {
        this.handlers.push(handler);
    }

    public async route(rawRequest: RawRequest): Promise<Response> {
        try {
            return await this.handleRequestErrors(async () => {
                if (!isMethod(rawRequest.method)) {
                    throw new MethodNotSupportedError(''); // TODO
                }

                const { method, path, body } = rawRequest;
                const request = new Request(method, path, body);
                const pathComponents = new UrlPathComponents(path);
                const matchedHandler = this.handlers.find((handler) =>
                    handler.isMatching(request, pathComponents),
                );

                if (matchedHandler === undefined) {
                    throw new HandlerNotFoundError(
                        `A handler could not be found for the route: ${path}`,
                    );
                }

                return await matchedHandler.handleRequest(request, pathComponents);
            });
        } catch (error) {
            if (error instanceof HandlerNotFoundError) {
                return {
                    statusCode: 404,
                    body: {
                        message: 'Not found.',
                    },
                };
            }

            return {
                statusCode: 500,
                body: {
                    message: 'Internal error.',
                },
            };
        }
    }

    protected async handleRequestErrors(
        responseProvider: () => Promise<Response>,
    ): Promise<Response> {
        return await responseProvider();
    }
}
