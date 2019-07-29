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
        let body: string | undefined;

        if (typeof event.body === 'string') {
            body = event.isBase64Encoded
                ? JSON.parse(new Buffer(event.body, 'base64').toString('ascii'))
                : JSON.parse(event.body);
        }

        const { httpMethod: method, path } = event;

        const response = await this.router.route({
            method,
            path,
            headers: new Map(), // TODO
            body,
        });

        if (!response.headers) {
            response.headers = new Map();
        }

        response.headers.set('Content-Type', 'application/json');

        return {
            statusCode: response.statusCode,
            statusDescription: http.STATUS_CODES[response.statusCode] || '',
            headers: Array.from(response.headers).reduce((previous, current) => {
                (previous as any)[current[0]] = current[1];
                return previous;
            }, {}),
            body: response.body === undefined ? '' : JSON.stringify(response.body),
            isBase64Encoded: false,
        };
    }
}
