import { PathNotMatchingError } from '../../errors';
import { Handler } from '../../Handler';
import { MatchableRoute } from '../../MatchableRoute';
import { RouterRequest, RouterResponse } from '../../types';
import { UrlPathComponents } from '../../UrlPathComponents';

describe('Handler', () => {
    const matchablePath = new MatchableRoute('GET', '/a/:b', {
        b: (value) => value,
    });

    const handler = new Handler(
        matchablePath,
        (): RouterResponse => {
            return {
                status: 200,
                headers: new Map(),
                body: {
                    success: true,
                },
            };
        },
    );

    const asyncHandler = new Handler(
        matchablePath,
        async (): Promise<RouterResponse> => {
            return {
                status: 200,
                headers: new Map(),
                body: {
                    success: true,
                },
            };
        },
    );

    it('should match and handle request', async () => {
        const request: RouterRequest = {
            method: 'GET',
            path: '/a/1',
            headers: new Map(),
            body: {}
        };
        const path = new UrlPathComponents('/a/1');

        expect(handler.isMatching(request, path)).toBe(true);
        expect(await handler.handleRequest(request, path)).toEqual({
            status: 200,
            headers: new Map(),
            body: {
                success: true,
            },
        });
    });

    it('should not match but still handle request', async () => {
        const request: RouterRequest = {
            method: 'POST',
            path: '/a/1',
            headers: new Map(),
            body: {}
        };
        const path = new UrlPathComponents('/a/1');

        expect(handler.isMatching(request, path)).toBe(false);
        expect(await handler.handleRequest(request, path)).toEqual({
            status: 200,
            headers: new Map(),
            body: {
                success: true,
            },
        });
    });

    it('should not match or handle request', async () => {
        const request: RouterRequest = {
            method: 'GET',
            path: '/b/1',
            headers: new Map(),
            body: {},
        };
        const path = new UrlPathComponents('/b/1');

        expect(handler.isMatching(request, path)).toBe(false);
        expect(handler.handleRequest(request, path)).rejects.toBeInstanceOf(PathNotMatchingError);
    });

    it('should await an async function', async () => {
        const request: RouterRequest = {
            method: 'GET',
            path: '/a/1',
            headers: new Map(),
            body: {},
        };
        const path = new UrlPathComponents('/a/1');

        expect(await asyncHandler.handleRequest(request, path)).toEqual({
            status: 200,
            headers: new Map(),
            body: {
                success: true,
            },
        });
    });
});
