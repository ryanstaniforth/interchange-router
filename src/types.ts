export interface RawRequest {
    method: string;
    path: string;
    body: unknown;
}

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const isMethod = (value: string): value is Method => {
    return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(value);
};

export type PathParameterValidator = (value: string) => unknown;

export interface Response {
    statusCode: number;
    body: unknown;
}
