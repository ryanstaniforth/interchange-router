import { InvalidRequestBodyError } from '../../errors';
import { Handler } from '../../Handler';
import { Request } from '../../Request';
import { Router } from '../../Router';
import { Response } from '../../types';
import { UrlPathComponents } from '../../UrlPathComponents';
import { createMockInstance } from '../helpers';

jest.mock('../../Handler');

describe('Router', () => {
    describe('handleRequest()', () => {
        it('should call Handler.isMatching() with correct parameters', () => {
            const router = new Router();
            const handler = createMockInstance(Handler);

            router.registerHandler(handler);

            const response = router.route({
                method: 'POST',
                path: '/path',
                headers: {},
                body: { a: 123 },
            });

            expect(response).resolves.toEqual({
                statusCode: 404,
                body: {
                    message: 'Not found.',
                },
            });

            expect(handler.isMatching).toHaveBeenCalledTimes(1);

            expect(handler.isMatching.mock.calls[0][0]).toBeInstanceOf(Request);
            expect((handler.isMatching.mock.calls[0][0] as Request).method).toBe('POST');
            expect((handler.isMatching.mock.calls[0][0] as Request).path).toBe('/path');
            expect((handler.isMatching.mock.calls[0][0] as Request).body).toEqual({ a: 123 });

            expect(handler.isMatching.mock.calls[0][1]).toBeInstanceOf(UrlPathComponents);
            expect((handler.isMatching.mock.calls[0][1] as UrlPathComponents).components).toEqual([
                'path',
            ]);
        });

        describe('handler response handling', () => {
            let router: Router;
            let handler: jest.Mocked<Handler<any>>;

            beforeEach(() => {
                router = new Router();
                handler = createMockInstance(Handler);

                router.registerHandler(handler);
            });

            it('should return given response', async () => {
                const response: Response = {
                    statusCode: 200,
                    body: {
                        success: true,
                    },
                };

                handler.isMatching.mockReturnValue(true);
                handler.handleRequest.mockImplementation(async () => response);

                expect(
                    await router.route({
                        method: 'POST',
                        path: '/path',
                        headers: {},
                        body: undefined,
                    }),
                ).toEqual(response);
            });

            it('should handle invalid request body', async () => {
                handler.isMatching.mockReturnValue(true);
                handler.handleRequest.mockImplementation(async () => {
                    throw new InvalidRequestBodyError('');
                });

                expect(
                    await router.route({
                        method: 'POST',
                        path: '/path',
                        headers: {},
                        body: undefined,
                    }),
                ).toEqual({
                    statusCode: 400,
                    body: {
                        message: 'Invalid request.',
                    },
                });
            });

            it('should handle unexpected errors', async () => {
                handler.isMatching.mockReturnValue(true);
                handler.handleRequest.mockImplementation(async () => {
                    throw new Error();
                });

                expect(
                    await router.route({
                        method: 'POST',
                        path: '/path',
                        headers: {},
                        body: undefined,
                    }),
                ).toEqual({
                    statusCode: 500,
                    body: {
                        message: 'Internal error.',
                    },
                });
            });
        });
    });

    describe('handleRequest()', () => {
        let router: Router;
        let handler1: jest.Mocked<Handler<any>>;
        let handler2: jest.Mocked<Handler<any>>;
        let handler3: jest.Mocked<Handler<any>>;

        beforeEach(() => {
            router = new Router();
            handler1 = createMockInstance(Handler);
            handler2 = createMockInstance(Handler);
            handler3 = createMockInstance(Handler);

            router.registerHandler(handler1);
            router.registerHandler(handler2);
            router.registerHandler(handler3);
        });

        it('should match first handler and stop', async () => {
            handler1.isMatching.mockReturnValue(true);
            handler2.isMatching.mockReturnValue(true);
            handler3.isMatching.mockReturnValue(true);

            await router.route({
                method: 'POST',
                path: '/path',
                headers: {},
                body: undefined,
            });

            expect(handler1.isMatching).toHaveBeenCalledTimes(1);
            expect(handler2.isMatching).not.toHaveBeenCalled();
            expect(handler3.isMatching).not.toHaveBeenCalled();
        });

        it('should match second handler and stop', async () => {
            handler1.isMatching.mockReturnValue(false);
            handler2.isMatching.mockReturnValue(true);
            handler3.isMatching.mockReturnValue(true);

            await router.route({
                method: 'POST',
                path: '/path',
                headers: {},
                body: undefined,
            });

            expect(handler1.isMatching).toHaveBeenCalledTimes(1);
            expect(handler2.isMatching).toHaveBeenCalledTimes(1);
            expect(handler3.isMatching).not.toHaveBeenCalled();
        });

        it('should match thrid handler', async () => {
            handler1.isMatching.mockReturnValue(false);
            handler2.isMatching.mockReturnValue(false);
            handler3.isMatching.mockReturnValue(true);

            await router.route({
                method: 'POST',
                path: '/path',
                headers: {},
                body: undefined,
            });

            expect(handler1.isMatching).toHaveBeenCalledTimes(1);
            expect(handler2.isMatching).toHaveBeenCalledTimes(1);
            expect(handler3.isMatching).toHaveBeenCalledTimes(1);
        });
    });

    describe('registerResponseHeaderModifier()', () => {
        it('', async () => {
            const router = new Router();
            const handler = createMockInstance(Handler);

            router.registerHandler(handler);

            router.registerResponseHeaderModifier(() => {
                return {
                    'x-test': 'abc',
                };
            });

            const response = await router.route({
                method: 'GET',
                path: '/path',
                headers: {},
                body: undefined,
            });

            expect(response.headers).toEqual({
                'x-test': 'abc',
            });
        });
    })
});
