import { HandlerNotFoundError, InvalidRequestBodyError, MethodNotSupportedError } from './errors';
import { Handler } from './Handler';
import { Request } from './Request';
import { Headers, isMethod, RawRequest, Response } from './types';
import { UrlPathComponents } from './UrlPathComponents';

type ResponseHeaderModifier = (requestHeaders: Headers) => Headers;

export class Router {
    private handlers: Array<Handler<any>> = [];
    private responseHeaderModifier: ResponseHeaderModifier | undefined;

    public registerHandler(handler: Handler<any>): void {
        this.handlers.push(handler);
    }

    public registerResponseHeaderModifier(modifier: ResponseHeaderModifier): void {
        this.responseHeaderModifier = modifier;
    }

    public async route(rawRequest: RawRequest): Promise<Response> {
        let response: Response;

        try {
            response = await this.handleRequestErrors(async () => {
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
                response = {
                    statusCode: 404,
                    body: {
                        message: 'Not found.',
                    },
                };
            } else if (error instanceof InvalidRequestBodyError) {
                response = {
                    statusCode: 400,
                    body: {
                        message: 'Invalid request.',
                    },
                };
            } else {
                response = {
                    statusCode: 500,
                    body: {
                        message: 'Internal error.',
                    },
                };
            }
        }

        if (this.responseHeaderModifier !== undefined) {
            response.headers = {
                // ...response.headers,
                ...this.responseHeaderModifier(rawRequest.headers),
            };
        }

        return response;
    }

    protected async handleRequestErrors(
        responseProvider: () => Promise<Response>,
    ): Promise<Response> {
        return await responseProvider();
    }
}
