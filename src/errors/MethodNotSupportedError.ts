/**
 * Thrown when a request is received using an unmatched method.
 */
export class MethodNotSupportedError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'MethodNotSupportedError';
    }
}
