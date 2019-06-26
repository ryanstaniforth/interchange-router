> WARNING: This library is still in development, and the following documentation is very incomplete.

# Interchange Router

`interchange-router` is an opinionated HTTP router with one main design goal:

To have a separation of route handling and the technology delivering incomming HTTP requests.

This enables you to build your routes and acompanying handlers, while being free to easily switch between different technologies that facilitiate the incomming requests.

This library provides support for routing requests with the node.js `http` standard library as well as AWS lambdas. You may also extend functionality to others.

## Install

```bash
npm install --save interchange-router
```

> TypeScript definitions are bundled and do not require a separate install.

## Architectural Overview

### MatchableRoute

A `MatchableRoute` defines a URL method, path, and path parameters. It can then determine if a given HTTP request matches its given configuration.

### Handler

A `Handler` contains the logic to process any input and generate a response.

### Router

A `Router` has `Handler`s attached to it. HTTP requests are passed to it to be forwarded onto the first matching `Handler`.

### transformers

Transformers such as `HttpTransformer` and `LambdaTransformer` are initialised with a router. Transformers provide an implementation to transform a HTTP request from a given technology to one that the `Router` accepts.

## Usage

Create a basic handler returning a statusCode and JSON body.

```typescript
# getUsers.ts

import { Handler, MatchableRoute } from 'interchange-router';

const getUsersRoute = new MatchableRoute('GET', '/users');

export const getUsersHandler = new Handler(getUsersRoute, (request) => {
    return {
        statusCode: 200,
        body: {
            users: [],
        },
    };
});
```

```typescript
# createProduct.ts

import { Handler, MatchableRoute } from 'interchange-router';

const createUserProductRoute = new MatchableRoute('POST', '/users/:userId/products', {
    userId: value => value;
});

export const createProductHandler = new Handler(createUserProductRoute, async (request, { userId }) => {
    return {
        statusCode: 200,
        body: {
            success: true,
        },
    };
});
```

```typescript
# router.ts

import { Router } from 'interchange-router';
import { createProductHandler } from './createProduct';
import { getUsersHandler } from './getUsers';

export const router = new Router();

router.attach(createUserProductRoute);
router.attach(getUsersHandler);
```

```typescript
import * as http from 'http';
import { HttpTransformer } from 'interchange-router';
import { router } from './router';

const httpTransformer = new HttpTransformer(router);
const server = http.createServer(httpTransformer.requestListener);

server.listen(80);
```

```typescript
import { LambdaTransformer } from 'interchange-router';
import { router } from './router';

const lambdaTransformer = new LambdaTransformer(router);

export const handler = lambdaTransformer.asyncHandler;

// or:
// export const handler = lambdaTransformer.handler;
```
