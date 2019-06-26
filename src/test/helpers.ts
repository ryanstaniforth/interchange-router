// tslint:disable:max-classes-per-file

import { Readable, Writable } from 'stream';

export const createMockInstance = <T>(MockClass: new (...args: any[]) => T): jest.Mocked<T> => {
    return new MockClass() as jest.Mocked<T>;
};

export class IncommingMessageMock extends Readable {
    public constructor(public method: string, public url: string, private body: string) {
        super();
    }

    public _read() {
        this.push(this.body);
        this.push(null);
    }
}

export class ServerResponseMock extends Writable {
    public statusCode: number | undefined;
    public body: string = '';

    public _write(chunk: any, _: string, next: () => void) {
        this.body += chunk.toString();
        next();
    }
}
