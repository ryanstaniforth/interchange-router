import { Handler } from '../../Handler';
import { MatchableRoute } from '../../MatchableRoute';
import { Request } from '../../Request';
import { Response } from '../../types';
import { UrlPathComponents } from '../../UrlPathComponents';

describe('Handler', () => {
    it('', async () => {
        const matchablePath = new MatchableRoute('GET', '/a/:b', {
            b: (value) => value,
        });

        const handler = new Handler(
            matchablePath,
            (): Response => {
                return {
                    statusCode: 200,
                    body: {
                        success: true,
                    },
                };
            },
        );

        const request1 = new Request('GET', 'http://a/1', {});
        const path1 = new UrlPathComponents('/a/1');

        const request2 = new Request('POST', 'http://a/1', {});
        const path2 = new UrlPathComponents('/a/1');

        const request3 = new Request('GET', 'http://a/1', {});
        const path3 = new UrlPathComponents('/a/1');

        expect(handler.isMatching(request1, path1)).toBe(true);
        expect(await handler.handleRequest(request1, path1)).toEqual({
            statusCode: 200,
            body: {
                success: true,
            },
        });

        expect(handler.isMatching(request2, path2)).toBe(false);
        expect(await handler.handleRequest(request2, path2)).toEqual({
            statusCode: 200,
            body: {
                success: true,
            },
        });

        expect(handler.isMatching(request3, path3)).toBe(true);
        expect(await handler.handleRequest(request3, path3)).toEqual({
            statusCode: 200,
            body: {
                success: true,
            },
        });
    });
});
