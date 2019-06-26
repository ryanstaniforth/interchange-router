import {
    InvalidUrlPathError,
    PathParameterExcessError,
    PathParameterNotExistsError,
    PathParameterValidationError,
} from '../../errors';
import { MatchableRoute } from '../../MatchableRoute';
import { UrlPathComponents } from '../../UrlPathComponents';

describe('MatchableRoute', () => {
    describe('new()', () => {
        it('should throw if given malformed URL', () => {
            expect(() => new MatchableRoute('GET', 'a', {})).toThrow(InvalidUrlPathError);
            expect(() => new MatchableRoute('GET', '/a//b', {})).toThrow(InvalidUrlPathError);
            expect(() => new MatchableRoute('GET', '/a/b/', {})).toThrow(InvalidUrlPathError);
        });

        it('should throw if missing a parameter validator', () => {
            expect(() => new MatchableRoute('GET', '/a/:b', {})).toThrow(
                PathParameterNotExistsError,
            );
            expect(() => new MatchableRoute('GET', '/:a/:b', { a: () => '' })).toThrow(
                PathParameterNotExistsError,
            );
            expect(() => new MatchableRoute('GET', '/:a/:b', { b: () => '' })).toThrow(
                PathParameterNotExistsError,
            );
        });

        it('should throw if given an excess parameter validator', () => {
            expect(() => new MatchableRoute('GET', '/a', { a: () => '' })).toThrow(
                PathParameterExcessError,
            );
            expect(() => new MatchableRoute('GET', '/:a', { a: () => '', b: () => '' })).toThrow(
                PathParameterExcessError,
            );
            expect(() => new MatchableRoute('GET', '/a/:b', { a: () => '', b: () => '' })).toThrow(
                PathParameterExcessError,
            );
        });
    });

    describe('isPathMatching()', () => {
        const matchablePath = new MatchableRoute('GET', '/a', {});

        it('should return true if path does match', () => {
            const path = new UrlPathComponents('/a');

            expect(matchablePath.isPathMatching(path)).toBe(true);
        });

        it('should return false if path does not match', () => {
            const path = new UrlPathComponents('/b');
            const path2 = new UrlPathComponents('/b/c');

            expect(matchablePath.isPathMatching(path)).toBe(false);
            expect(matchablePath.isPathMatching(path2)).toBe(false);
        });
    });

    describe('isMethodAndPathMatching()', () => {
        const matchablePath = new MatchableRoute('POST', '/a', {});
        const goodPath = new UrlPathComponents('/a');
        const badPath = new UrlPathComponents('/b');

        it('should return true if method and path do match', () => {
            expect(matchablePath.isMethodAndPathMatching('POST', goodPath)).toBe(true);
        });

        it('should return false if path does not match', () => {
            expect(matchablePath.isMethodAndPathMatching('GET', goodPath)).toBe(false);
            expect(matchablePath.isMethodAndPathMatching('PUT', goodPath)).toBe(false);
            expect(matchablePath.isMethodAndPathMatching('PATCH', goodPath)).toBe(false);
            expect(matchablePath.isMethodAndPathMatching('DELETE', goodPath)).toBe(false);

            expect(matchablePath.isMethodAndPathMatching('GET', badPath)).toBe(false);
            expect(matchablePath.isMethodAndPathMatching('POST', badPath)).toBe(false);
            expect(matchablePath.isMethodAndPathMatching('PUT', badPath)).toBe(false);
            expect(matchablePath.isMethodAndPathMatching('PATCH', badPath)).toBe(false);
            expect(matchablePath.isMethodAndPathMatching('DELETE', badPath)).toBe(false);
        });
    });

    describe('getParameters()', () => {
        it('should return correct parameters', () => {
            const b = jest.fn(() => '1');
            const d = jest.fn(() => '2');

            const matchablePath = new MatchableRoute('GET', '/a/:b/c/:d', {
                b,
                d,
            });

            const path = new UrlPathComponents('/a/1/c/2');

            expect(matchablePath.isPathMatching(path)).toBe(true);
            expect(matchablePath.getParameters(path)).toEqual({
                b: '1',
                d: '2',
            });

            expect(b).toBeCalledWith('1');
            expect(d).toBeCalledWith('2');
        });

        it('should throw if parameter validation fails', () => {
            const matchablePath = new MatchableRoute('GET', '/:a', {
                a: () => {
                    throw new PathParameterValidationError('');
                },
            });

            const path = new UrlPathComponents('/1');

            expect(() => matchablePath.isMethodAndPathMatching('GET', path)).toThrow(
                PathParameterValidationError,
            );
            expect(() => matchablePath.isPathMatching(path)).toThrow(PathParameterValidationError);
            expect(() => matchablePath.getParameters(path)).toThrow(PathParameterValidationError);
        });
    });
});
