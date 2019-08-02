import { Router } from '../../../Router';
import { HttpTransformer } from '../../../transformers';
import { createMockInstance, IncommingMessageMock, ServerResponseMock } from '../../helpers';

jest.mock('../../../Router');

describe('HttpTransformer', () => {
    describe('requestListener', () => {
        let router: jest.Mocked<Router>;
        let transformer: HttpTransformer;

        beforeEach(() => {
            router = createMockInstance(Router);
            transformer = new HttpTransformer(router);
        });

        it('should handle router response', (done) => {
            router.route.mockImplementation(async () => {
                return {
                    status: 200,
                    headers: new Map(),
                    body: {
                        success: true,
                    },
                };
            });

            const req = new IncommingMessageMock('GET', '/a', '');
            const res = new ServerResponseMock();

            res.on('finish', () => {
                expect(router.route).toBeCalledWith({
                    method: 'GET',
                    path: '/a',
                    headers: new Map(),
                    body: undefined,
                });

                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual(
                    JSON.stringify({
                        success: true,
                    }),
                );

                done();
            });

            transformer.requestListener(req as any, res as any);
        });

        it('should handle an undefined body', (done) => {
            router.route.mockImplementation(async () => {
                return {
                    status: 200,
                    headers: new Map(),
                    body: undefined,
                };
            });

            const req = new IncommingMessageMock('GET', '/a', '');
            const res = new ServerResponseMock();

            res.on('finish', () => {
                expect(router.route).toBeCalledWith({
                    method: 'GET',
                    path: '/a',
                    headers: new Map(),
                    body: undefined,
                });

                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual('');

                done();
            });

            transformer.requestListener(req as any, res as any);
        });

        it('should pass JSON request body onto router', (done) => {
            router.route.mockImplementation(async () => {
                return {
                    status: 200,
                    headers: new Map(),
                    body: {
                        success: true,
                    },
                };
            });

            const body = { a: 1, b: '2', c: [3, 4] };
            const req = new IncommingMessageMock('POST', '/b', JSON.stringify(body));
            const res = new ServerResponseMock();

            res.on('finish', () => {
                expect(router.route).toBeCalledWith({
                    method: 'POST',
                    path: '/b',
                    headers: new Map(),
                    body,
                });

                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual(
                    JSON.stringify({
                        success: true,
                    }),
                );

                done();
            });

            transformer.requestListener(req as any, res as any);
        });
    });
});
