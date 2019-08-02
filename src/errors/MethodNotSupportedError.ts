/**
 * Thrown when a request is received using an unmatched method.
 */
export class MethodNotSupportedError extends Error {
    public constructor() {
        super();
        this.name = 'MethodNotSupportedError';
    }
}
