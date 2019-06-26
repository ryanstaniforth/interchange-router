import { InvalidUrlPathError } from './errors';

export class UrlPathComponents {
    public components: string[];

    public constructor(path: string) {
        if (path[0] !== '/') {
            throw new InvalidUrlPathError(`"${path}" must begin with a slash`);
        }

        if (path === '/') {
            this.components = [];
            return;
        }

        const components = path.substr(1).split('/');

        if (components.find((component) => component === '') !== undefined) {
            throw new InvalidUrlPathError(`"${path}" contains a blank component`);
        }

        this.components = components;
    }
}
