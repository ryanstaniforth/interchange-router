export class InvalidRequestBodyError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'InvalidRequestBody';
    }
}
