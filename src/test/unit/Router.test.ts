import { ApplicationError } from '../../errors';
import { Handler } from '../../Handler';
import { Router } from '../../Router';
import { RouterRequest, RouterResponse } from '../../types';
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
                headers: new Map(),
                body: { a: 123 },
            });

            expect(response).resolves.toEqual({
                status: 404,
                headers: new Map(),
                body: {
                    message: 'Not found.',
                },
            });

            expect(handler.isMatching).toHaveBeenCalledTimes(1);

            expect((handler.isMatching.mock.calls[0][0] as RouterRequest).method).toBe('POST');
            expect((handler.isMatching.mock.calls[0][0] as RouterRequest).path).toBe('/path');
            expect((handler.isMatching.mock.calls[0][0] as RouterRequest).body).toEqual({ a: 123 });

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
                const response: RouterResponse = {
                    status: 200,
                    headers: new Map(),
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
                        headers: new Map(),
                        body: undefined,
                    }),
                ).toEqual(response);
            });

            it('should handle invalid request body', async () => {
                handler.isMatching.mockReturnValue(true);
                handler.handleRequest.mockImplementation(async () => {
                    throw new ApplicationError(400, 'Invalid request.');
                });

                expect(
                    await router.route({
                        method: 'POST',
                        path: '/path',
                        headers: new Map(),
                        body: undefined,
                    }),
                ).toEqual({
                    status: 400,
                    headers: new Map(),
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
                        headers: new Map(),
                        body: undefined,
                    }),
                ).toEqual({
                    status: 500,
                    headers: new Map(),
                    body: {
                        message: 'Internal Server Error',
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

            handler1.handleRequest.mockReturnValue(
                Promise.resolve({
                    status: 200,
                }),
            );
            handler2.handleRequest.mockReturnValue(
                Promise.resolve({
                    status: 200,
                }),
            );
            handler3.handleRequest.mockReturnValue(
                Promise.resolve({
                    status: 200,
                }),
            );

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
                headers: new Map(),
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
                headers: new Map(),
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
                headers: new Map(),
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
                return new Map([['x-test', 'abc']]);
            });

            const response = await router.route({
                method: 'GET',
                path: '/path',
                headers: new Map(),
                body: undefined,
            });

            expect(response.headers!.size).toBe(1);
            expect(response.headers!.get('x-test')).toBe('abc');
        });
    });
});
