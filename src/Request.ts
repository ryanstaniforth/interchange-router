import { Method } from './types';

export class Request {
    public constructor(
        public readonly method: Method,
        public readonly path: string,
        public readonly body: unknown | undefined,
    ) {}
}
