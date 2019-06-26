export class PathParameterExcessError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'PathParameterExcessError';
    }
}
