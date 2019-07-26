import { ALBEvent, ALBEventRequestContext } from 'aws-lambda';
import { Router } from '../../../Router';
import { LambdaTransformer } from '../../../transformers';
import { createMockInstance } from '../../helpers';

jest.mock('../../../Router');

describe('LambdaTransformer', () => {
    describe('asyncHandler', () => {
        let router: jest.Mocked<Router>;
        let transformer: LambdaTransformer;
        const requestContext: ALBEventRequestContext = {
            elb: {
                targetGroupArn: 'arn',
            },
        };

        beforeEach(() => {
            router = createMockInstance(Router);
            transformer = new LambdaTransformer(router);
        });

        it('should pass through request data and pass back response data', () => {
            const requestBody = {
                a: 1,
                b: 2,
            };

            const responseBody = {
                success: true,
            };

            router.route.mockImplementation(async () => {
                return {
                    statusCode: 200,
                    body: responseBody,
                };
            });

            const event: ALBEvent = {
                requestContext,
                httpMethod: 'GET',
                path: '/',
                body: JSON.stringify(requestBody),
                isBase64Encoded: false,
            };

            expect(transformer.asyncHandler(event, {} as any, {} as any)).resolves.toEqual({
                statusCode: 200,
                statusDescription: 'OK',
                body: JSON.stringify(responseBody),
                headers: {
                    'Content-Type': 'application/json',
                },
                isBase64Encoded: false,
            });

            expect(router.route).toBeCalledWith({
                method: 'GET',
                path: '/',
                headers: new Map(),
                body: JSON.stringify(requestBody),
            });
        });
    });
});
