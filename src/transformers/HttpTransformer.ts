import { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import { Router } from '../Router';
import { Response } from '../types';

export class HttpTransformer {
    public constructor(private router: Router) {
        this.requestListener = this.requestListener.bind(this);
    }

    public async requestListener(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const { method } = req;
        const path = this.getPathFromRequestUrl(req.url);
        const body = await this.getRequestJson(req);

        if (path === undefined) {
            res.write(JSON.stringify(this.createResponse(500, '')));
            res.end();

            return;
        }

        if (method === undefined) {
            res.write(JSON.stringify(this.createResponse(500, '')));
            res.end();

            return;
        }

        const response = await this.router.route({
            method,
            path,
            body,
        });

        res.statusCode = response.statusCode;
        res.write(JSON.stringify(response.body));
        res.end();
    }

    private getPathFromRequestUrl(url: string | undefined): string | undefined {
        if (url === undefined) {
            return undefined;
        }

        return parseUrl(url).pathname;
    }

    private async getRequestJson(req: IncomingMessage): Promise<unknown> {
        let data: string | undefined;

        req.on('data', (chunk) => {
            if (data === undefined) {
                data = '';
            }

            data += chunk;
        });

        return new Promise((resolve) => {
            req.on('end', () => {
                let json: object | undefined;

                if (data !== undefined) {
                    try {
                        json = JSON.parse(data);
                    } catch {
                        json = undefined;
                    }
                }

                resolve(json);
            });
        });
    }

    private createResponse(statusCode: number, message: string): Response {
        return {
            statusCode,
            body: {
                message,
            },
        };
    }
}
