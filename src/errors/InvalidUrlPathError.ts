/**
 * Thrown when a malformed URL path is parsed.
 */
export class InvalidUrlPathError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'InvalidUrlPathError';
    }
}
