import { PathNotMatchingError } from '../../errors';
import { Handler } from '../../Handler';
import { MatchableRoute } from '../../MatchableRoute';
import { Request } from '../../Request';
import { Response } from '../../types';
import { UrlPathComponents } from '../../UrlPathComponents';

describe('Handler', () => {
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

    const asyncHandler = new Handler(
        matchablePath,
        async (): Promise<Response> => {
            return {
                statusCode: 200,
                body: {
                    success: true,
                },
            };
        },
    );

    it('should match and handle request', async () => {
        const request = new Request('GET', 'http://a/1', {});
        const path = new UrlPathComponents('/a/1');

        expect(handler.isMatching(request, path)).toBe(true);
        expect(await handler.handleRequest(request, path)).toEqual({
            statusCode: 200,
            body: {
                success: true,
            },
        });
    });

    it('should not match but still handle request', async () => {
        const request = new Request('POST', 'http://a/1', {});
        const path = new UrlPathComponents('/a/1');

        expect(handler.isMatching(request, path)).toBe(false);
        expect(await handler.handleRequest(request, path)).toEqual({
            statusCode: 200,
            body: {
                success: true,
            },
        });
    });

    it('should not match or handle request', async () => {
        const request = new Request('GET', 'http://b/1', {});
        const path = new UrlPathComponents('/b/1');

        expect(handler.isMatching(request, path)).toBe(false);
        expect(handler.handleRequest(request, path)).rejects.toBeInstanceOf(PathNotMatchingError);
    });

    it('should await an async function', async () => {
        const request = new Request('GET', 'http://a/1', {});
        const path = new UrlPathComponents('/a/1');

        expect(await asyncHandler.handleRequest(request, path)).toEqual({
            statusCode: 200,
            body: {
                success: true,
            },
        });
    });
});
