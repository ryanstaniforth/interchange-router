export class PathParameterNotExistsError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'PathParameterNotExistsError';
    }
}
