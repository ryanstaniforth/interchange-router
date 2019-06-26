export class HandlerNotFoundError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'HandlerNotFoundError';
    }
}
