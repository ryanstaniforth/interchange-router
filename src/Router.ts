import { STATUS_CODES } from 'http';
import { ApplicationError, MethodNotSupportedError } from './errors';
import { Handler } from './Handler';
import { ApplicationResponse, Headers, isMethod, RouterRequest, RouterResponse } from './types';
import { UrlPathComponents } from './UrlPathComponents';

type ResponseHeaderModifier = (requestHeaders: Headers) => Headers;

type CorsHandler = (origin: string) => { valid: boolean };

export class Router {
    private handlers: Array<Handler<any>> = [];
    private responseHeaderModifier: ResponseHeaderModifier | undefined;
    private corsHandler: CorsHandler | undefined;

    public registerHandler(handler: Handler<any>): void {
        this.handlers.push(handler);
    }

    public registerResponseHeaderModifier(modifier: ResponseHeaderModifier): void {
        this.responseHeaderModifier = modifier;
    }

    public registerCorsHandler(corsVerifier: CorsHandler): void {
        this.corsHandler = corsVerifier;
    }

    public async route(request: RouterRequest): Promise<RouterResponse> {
        let response: ApplicationResponse;

        try {
            response = await this.handleRequestErrors(async () => {
                const { method, path } = request;

                if (method === 'OPTIONS') {
                    return {
                        status: 200,
                    };
                }

                if (!isMethod(method)) {
                    throw new MethodNotSupportedError();
                }

                const pathComponents = new UrlPathComponents(path);
                const matchedHandler = this.handlers.find((handler) =>
                    handler.isMatching(request, pathComponents),
                );

                if (matchedHandler === undefined) {
                    throw new ApplicationError(404, 'Not found.');
                }

                return await matchedHandler.handleRequest(request, pathComponents);
            });
        } catch (error) {
            if (error instanceof ApplicationError) {
                response = {
                    status: error.status,
                    headers: new Map(),
                    body: {
                        message:
                            error.errorMessage || STATUS_CODES[error.status] || STATUS_CODES[500],
                    },
                };
            } else {
                response = {
                    status: 500,
                    headers: new Map(),
                    body: {
                        message: STATUS_CODES[500],
                    },
                };
            }
        }

        if (this.corsHandler) {
            const origin = request.headers.get('origin');

            if (typeof origin === 'string') {
                const cors = this.corsHandler(origin);
                const corsHeaders = new Map();

                if (cors.valid) {
                    corsHeaders.set('access-control-allow-origin', origin);
                }

                response.headers = new Map([
                    ...(response.headers || []),
                    ...corsHeaders,
                ]);
            }
        }

        if (this.responseHeaderModifier !== undefined) {
            response.headers = new Map([
                ...(response.headers || []),
                ...this.responseHeaderModifier(request.headers),
            ]);
        }

        return {
            status: response.status,
            headers: response.headers || new Map(),
            body: response.body,
        };
    }

    protected async handleRequestErrors(
        responseProvider: () => Promise<ApplicationResponse>,
    ): Promise<ApplicationResponse> {
        return await responseProvider();
    }
}
