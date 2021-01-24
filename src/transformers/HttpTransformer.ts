import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { Router } from '../Router';

const INTERNAL_ERROR_MESSAGE = JSON.stringify({
    message: 'Internal error.',
});

export class HttpTransformer {
    public constructor(private router: Router) {
        this.requestListener = this.requestListener.bind(this);
    }

    public async requestListener(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const { method } = req;
        const path = this.getPathFromRequestUrl(req.url);
        const headers = this.getHeaders(req);
        const body = await this.getRequestJson(req);

        if (path === undefined) {
            res.statusCode = 500;
            res.write(INTERNAL_ERROR_MESSAGE);
            res.end();

            return;
        }

        if (method === undefined) {
            res.statusCode = 500;
            res.write(INTERNAL_ERROR_MESSAGE);
            res.end();

            return;
        }

        const response = await this.router.route({
            method,
            path,
            headers,
            body,
        });

        res.statusCode = response.status;

        for (const [key, value] of response.headers.entries()) {
            res.setHeader(key, value);
        }

        if (response.body === undefined) {
            res.write('');
        } else {
            const bodyString = JSON.stringify(response.body);

            if (typeof bodyString !== 'string') {
                res.statusCode = 500;
                res.write(INTERNAL_ERROR_MESSAGE);
            }

            res.write(bodyString);
        }

        res.end();
    }

    private getPathFromRequestUrl(url: string | undefined): string | undefined {
        if (url === undefined) {
            return undefined;
        }

        return new URL(url, 'https://example.com').pathname;
    }

    private getHeaders(req: IncomingMessage): Map<string, string> {
        const headers = new Map();

        for (const key in req.headers) {
            if (req.headers.hasOwnProperty(key)) {
                headers.set(key, req.headers[key]);
            }
        }

        return headers;
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
}
