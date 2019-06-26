import {
    PathNotMatchingError,
    PathParameterExcessError,
    PathParameterNotExistsError,
} from './errors';
import { Method, PathParameterValidator } from './types';
import { UrlPathComponents } from './UrlPathComponents';

export class MatchableRoute<
    Validators extends { [key: string]: PathParameterValidator }
> extends UrlPathComponents {
    public constructor(
        public readonly method: Method,
        path: string,
        private readonly validators: Validators,
        private readonly pathParameterPrefix: string = ':',
    ) {
        super(path);

        let processedIds: number = 0;

        for (const component of this.components) {
            const parameterId = this.getParameterIdFromComponent(component);

            if (parameterId !== undefined) {
                this.getValidatorFromParameterId(parameterId);
                processedIds++;
            }
        }

        if (Object.keys(validators).length > processedIds) {
            throw new PathParameterExcessError('More validators passed than needed.');
        }
    }

    public isMethodAndPathMatching(method: Method, urlPathComponents: UrlPathComponents): boolean {
        if (method !== this.method) {
            return false;
        }

        return this.isPathMatching(urlPathComponents);
    }

    public isPathMatching(urlPathComponents: UrlPathComponents): boolean {
        try {
            this.getParameters(urlPathComponents);
        } catch (error) {
            if (error instanceof PathNotMatchingError) {
                return false;
            }

            throw error;
        }

        return true;
    }

    public getParameters(
        path: UrlPathComponents,
    ): { [K in keyof Validators]: ReturnType<Validators[K]> } {
        if (path.components.length !== this.components.length) {
            throw new PathNotMatchingError('Path does not match');
        }

        const parameters: { [key: string]: unknown } = {};

        for (let i = 0; i < this.components.length; i++) {
            const component = path.components[i];
            const matchableComponent = this.components[i];
            const parameterId = this.getParameterIdFromComponent(matchableComponent);

            if (parameterId === undefined) {
                if (component !== matchableComponent) {
                    throw new PathNotMatchingError('Path does not match');
                }
            } else {
                parameters[parameterId] = this.getValidatorFromParameterId(parameterId)(component);
            }
        }

        return parameters as any;
    }

    private getParameterIdFromComponent(component: string): string | undefined {
        if (component.startsWith(this.pathParameterPrefix) === false) {
            return undefined;
        }

        return component.replace(this.pathParameterPrefix, '');
    }

    private getValidatorFromParameterId(parameterId: string): PathParameterValidator {
        if (this.validators.hasOwnProperty(parameterId) === false) {
            throw new PathParameterNotExistsError(
                `Missing validator for parameter id: ${parameterId}`,
            );
        }

        return this.validators[parameterId];
    }
}
