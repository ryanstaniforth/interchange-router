import { InvalidUrlPathError } from '../../errors';
import { UrlPathComponents } from '../../UrlPathComponents';

describe('UrlPathComponents', () => {
    describe('new()', () => {
        it('should calculate components correctly', () => {
            expect(new UrlPathComponents('/').components).toEqual([]);
            expect(new UrlPathComponents('/a').components).toEqual(['a']);
            expect(new UrlPathComponents('/a/b').components).toEqual(['a', 'b']);
            expect(new UrlPathComponents('/a/b/c').components).toEqual(['a', 'b', 'c']);
        });

        it('should throw for malformed URLs', () => {
            expect(() => new UrlPathComponents('')).toThrow(InvalidUrlPathError);
            expect(() => new UrlPathComponents('/a/')).toThrow(InvalidUrlPathError);
            expect(() => new UrlPathComponents('/a//b')).toThrow(InvalidUrlPathError);
        });
    });
});
