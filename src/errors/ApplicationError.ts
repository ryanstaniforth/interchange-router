export class ApplicationError extends Error {
    public constructor(public readonly status: number, public readonly errorMessage?: string) {
        super();
    }
}
