import { ALBEvent, ALBResult, Callback, Context } from 'aws-lambda';
import * as http from 'http';
import { Router } from '../Router';

export class LambdaTransformer {
    public constructor(private router: Router) {
        this.handler = this.handler.bind(this);
        this.asyncHandler = this.asyncHandler.bind(this);
    }

    public handler(event: ALBEvent, context: Context, callback: Callback<ALBResult>): void {
        this.handleEvent(event, context).then((result) => {
            callback(undefined, result);
        });
    }

    public async asyncHandler(
        event: ALBEvent,
        context: Context,
        _: Callback<ALBResult>,
    ): Promise<ALBResult> {
        return await this.handleEvent(event, context);
    }

    private async handleEvent(event: ALBEvent, _: Context): Promise<ALBResult> {
        const { httpMethod: method, path } = event;
        const headers = this.getHeaders(event);
        const body = this.getRequestJson(event);

        const response = await this.router.route({
            method,
            path,
            headers,
            body,
        });

        if (!response.headers) {
            response.headers = new Map();
        }

        response.headers.set('Content-Type', 'application/json');

        return {
            statusCode: response.status,
            statusDescription: http.STATUS_CODES[response.status] || '',
            headers: Array.from(response.headers).reduce((previous, current) => {
                (previous as any)[current[0]] = current[1];
                return previous;
            }, {}),
            body: response.body === undefined ? '' : JSON.stringify(response.body),
            isBase64Encoded: false,
        };
    }

    private getHeaders(event: ALBEvent): Map<string, string> {
        const headers = new Map();

        if (event.headers) {
            for (const key in event.headers) {
                if (event.headers.hasOwnProperty(key)) {
                    headers.set(key, event.headers[key]);
                }
            }
        }

        if (event.multiValueHeaders) {
            for (const key in event.multiValueHeaders) {
                if (event.multiValueHeaders.hasOwnProperty(key)) {
                    headers.set(key, event.multiValueHeaders[key]);
                }
            }
        }

        return headers;
    }

    private getRequestJson(event: ALBEvent): unknown {
        const { isBase64Encoded } = event;
        let { body } = event;

        if (typeof body !== 'string') {
            return undefined;
        }

        if (isBase64Encoded) {
            body = new Buffer(body, 'base64').toString('ascii');
        }

        try {
            return JSON.parse(body);
        } catch (error) {
            return undefined;
        }
    }
}
