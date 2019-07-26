import { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
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
            headers: new Map(), // TODO
            body,
        });

        res.statusCode = response.statusCode;

        // if (response.headers) {
        //     for (let key in response.headers) {
        //         res.setHeader('');
        //     }
        // }

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
}
