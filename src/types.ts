export interface Headers {
    [key: string]: string;
}

export interface RawRequest {
    method: string;
    path: string;
    headers: Headers;
    body: unknown;
}

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const isMethod = (value: string): value is Method => {
    return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(value);
};

export type PathParameterValidator = (value: string) => unknown;

export interface Response {
    statusCode: number;
    headers?: Headers;
    body: unknown;
}
