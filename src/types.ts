export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const isMethod = (value: string): value is Method => {
    return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(value);
};

export type Headers = Map<string, string | string[]>;

export interface RouterRequest {
    method: string;
    path: string;
    headers: Headers;
    body: unknown;
}

export interface RouterResponse {
    status: number;
    headers: Headers;
    body: unknown;
}

export interface ApplicationResponse {
    status: number;
    headers?: Headers;
    body?: unknown;
}

export type PathParameterValidator = (value: string) => unknown;
