import { Handler, HttpTransformer, MatchableRoute, Response, Router } from '../..';
import { IncommingMessageMock, ServerResponseMock } from '../helpers';

describe('http', () => {
    let router: Router;
    let httpTransformer: HttpTransformer;

    beforeEach(() => {
        router = new Router();
        httpTransformer = new HttpTransformer(router);
    });

    it('', async (done) => {
        const req = new IncommingMessageMock('GET', '/', '');
        const res = new ServerResponseMock();

        httpTransformer.requestListener(req as any, res as any);

        res.on('finish', () => {
            expect(res.statusCode).toBe(404);
            expect(res.body).toBe(
                JSON.stringify({
                    message: 'Not found.',
                }),
            );

            done();
        });
    });

    describe('', () => {
        beforeEach(() => {
            router.registerHandler(
                new Handler(
                    new MatchableRoute('GET', '/a', {}),
                    (): Response => {
                        return {
                            statusCode: 200,
                            body: {
                                a: 1,
                            },
                        };
                    },
                ),
            );

            router.registerHandler(
                new Handler(
                    new MatchableRoute('GET', '/b', {}),
                    (): Response => {
                        return {
                            statusCode: 200,
                            body: {
                                b: 2,
                            },
                        };
                    },
                ),
            );

            router.registerHandler(
                new Handler(
                    new MatchableRoute('GET', '/c', {}),
                    (): Response => {
                        return {
                            statusCode: 200,
                            body: {
                                c: 3,
                            },
                        };
                    },
                ),
            );
        });

        it('', async (done) => {
            const req = new IncommingMessageMock('GET', '/a', '');
            const res = new ServerResponseMock();

            httpTransformer.requestListener(req as any, res as any);

            res.on('finish', () => {
                expect(res.statusCode).toBe(200);
                expect(res.body).toBe(
                    JSON.stringify({
                        a: 1,
                    }),
                );

                done();
            });
        });

        it('', async (done) => {
            const req = new IncommingMessageMock('GET', '/b', '');
            const res = new ServerResponseMock();

            httpTransformer.requestListener(req as any, res as any);

            res.on('finish', () => {
                expect(res.statusCode).toBe(200);
                expect(res.body).toBe(
                    JSON.stringify({
                        b: 2,
                    }),
                );

                done();
            });
        });

        it('', async (done) => {
            const req = new IncommingMessageMock('GET', '/c', '');
            const res = new ServerResponseMock();

            httpTransformer.requestListener(req as any, res as any);

            res.on('finish', () => {
                expect(res.statusCode).toBe(200);
                expect(res.body).toBe(
                    JSON.stringify({
                        c: 3,
                    }),
                );

                done();
            });
        });
    });
});
