import { Request } from '../../Request';

describe('Request', () => {
    describe('new()', () => {
        it('should contain correct properties', () => {
            const request = new Request('GET', '/path', { a: 1, b: 2 });

            expect(request.method).toBe('GET');
            expect(request.path).toBe('/path');
            expect(request.body).toEqual({ a: 1, b: 2 });
        });
    });
});
