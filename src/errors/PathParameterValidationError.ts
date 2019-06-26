export class PathParameterValidationError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'PathParameterValidationError';
    }
}
