/**
 * Thrown when a path does not match a matchable path.
 */
export class PathNotMatchingError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'PathNotMatchingError';
    }
}
