# @kikiutils/nitro-session

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Easy-to-use nitro session.

- [✨ Release Notes](./CHANGELOG.md)

## Features

- 🔄 Continuous session between requests using a cookie or header
- 💾 Auto-save session
- 📦 Store session data using a cookie, header, or [unjs/unstorage](https://github.com/unjs/unstorage) drivers
- 🔒 Optional strict IP validation to ensure session security
- 🛠️ TypeScript support

## Environment Requirements

- ESM (ECMAScript Modules) only
- Nitro version 2.6.x or higher
- Node.js version 18 or higher

## Installation

1. Add dependency (example using pnpm).

```bash
pnpm add @kikiutils/nitro-session
```

You can also use yarn, npm, or bun to add the dependency.

2. Create a `server/plugins/session.ts` file and add the following code:

```typescript
import { nitroSession } from '@kikiutils/nitro-session';

export default defineNitroPlugin((nitroApp) => nitroSession(nitroApp, useRuntimeConfig().nitroSession));
```

3. Create a `server/utils/session.ts` file and add the following code:

```typescript
export * from '@kikiutils/nitro-session/runtime/utils';
```

> [!IMPORTANT]
> If you encounter warning messages such as `[unimport] failed to resolve ..., skip scanning` during runtime, updating the unimport version to 3.9.0 or higher will resolve the issue. If updating is not possible, use the following code instead:
>
> ```typescript
> export {
>     clearH3EventContextSession,
>     deleteH3EventContextSessionStorageData,
>     getH3EventContextSessionToken,
>     popH3EventContextSession
> } from '@kikiutils/nitro-session/runtime/utils';
> ```
>
> However, if you use this method, you will need to manually update the files whenever new utils are added. Using wildcard exports (`*`) will automatically export all utils, so it's recommended to use the latest version of unimport to support wildcard exports.

4. Create a `session.d.ts` file in the project folder and add the following code:

```typescript
declare module '@kikiutils/nitro-session' {
    interface H3EventContextSession {
        // Define the session data here.
    }
}

export {};
```

That's it! You're ready to use sessions in your Nitro app. Check out the [configuration](#configuration) and [usage](#usage) instructions below ✨.

## Configuration

Configure using `runtimeConfig` in `nitro.config.ts`.

```typescript
export default defineNitroConfig({
    // Configure options here
    runtimeConfig: { nitroSession: {} }
});
```

For detailed options, refer to the `PluginOptions` interface in [this file](./src/types/options.ts).

When using this session module, there are two types of data involved:

1. Stored Data: This refers to data such as user login information, login time, etc., which can be stored in memory or other specified storage.

2. Data Token: This refers to the token used to retrieve the corresponding data after the frontend sends a request to the server. This token can be transmitted using cookie or header.

### Stored Data

The available storage types are:

- azure-app-configuration
- azure-cosmos
- azure-key-vault
- azure-storage-blob
- azure-storage-table
- cloudflare-kv-binding
- cloudflare-kv-http
- cloudflare-r2-binding
- cookie/header
- fs
- fs-lite
- http
- lru-cache
- memory (default)
- mongodb
- netlify-blobs
- planetscale
- redis
- vercel-kv

> [!IMPORTANT]
> If the driver you are using is not `cookie/header` or `memory`, please visit [here](https://unstorage.unjs.io/drivers) for additional dependencies and considerations.
>
> When using `cookie/header` for storage, data will be encrypted and transmitted in requests based on the token type. In this case, no data is stored on the server. Please be aware of potential security risks such as interception, session hijacking, XSS, CSRF, and unauthorized access. Ensure that proper security measures are in place to protect your data.

Example configuration for using Redis as the data storage:

```typescript
export default defineNitroConfig({
    runtimeConfig: {
        nitroSession: {
            storage: {
                data: {
                    driver: 'redis',
                    // Options for the corresponding driver
                    options: { url: 'redis://127.0.0.1:6379' }
                }
            }
        }
    }
});
```

### Data Token

The available transmission types are:

- cookie (default)
- header

Example configuration for using header as the token transmission method:

```typescript
export default defineNitroConfig({
    runtimeConfig: {
        nitroSession: {
            storage: {
                token: {
                    driver: 'header',
                    // Options for the corresponding method
                    options: {
                        name: 'session',
                        setName: 'set-session'
                    }
                }
            }
        }
    }
});
```

When using cookie, the browser will automatically handle the `set-cookie` in the response and include the cookie in subsequent requests (in most cases).

When using header, you need to handle it manually. Set the token as the value of the key specified by `nitroSession.storage.token.options.name` when sending a request.

If the response contains a header with the name specified by `nitroSession.storage.token.options.setName`, you need to save this value and include it as the token in subsequent requests.

The following is an example code using Axios and storing the token in sessionStorage:

```typescript
import axios from 'axios';

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((request) => {
    request.headers.session = window.sessionStorage.getItem('session');
    return request;
});

axiosInstance.interceptors.response.use((response) => {
    const sessionToken = response.headers['set-session'];
    if (sessionToken !== undefined) {
        if (sessionToken) window.sessionStorage.setItem('session', sessionToken);
        else window.sessionStorage.removeItem('session');
    }

    return response;
});
```

## Usage

You can use `event.context.session` to access sessions.

The [on-change](https://www.npmjs.com/package/on-change) package is used internally to detect changes to the session object. If no changes are detected, no data will be stored and no cookie/header will be set.

`server/api/test.ts`

```typescript
export default defineEventHandler((event) => {
    event.context.session.account = 'account';
    event.context.session.username = 'name';
    // Remaining operations...
    return 'success';
});
```

`server/middleware/auth.ts`

```typescript
export default defineEventHandler((event) => {
    const loginedUserId = event.context.session.userId;
    // Remaining operations...
});
```

> [!IMPORTANT]
> The session can only store serializable data.

## Persist session on error

> [!IMPORTANT]
> This will replace the default Nitro error page.

Due to a bug in one or more of the packages (h3/hookable/nitro), to ensure that the session can still be properly handled after an error occurs during API processing, you need to modify the `errorHandler` setting in the `nitro.config`:

```typescript
export default defineNitroConfig({ errorHandler: './error-handler' });
```

Contents of `error-handler.ts` without using `send` function:

```typescript
export default () => {};
```

Contents of `error-handler.ts` using `send` function:

```typescript
import { processResponseEvent } from '@kikiutils/nitro-session';
import type {
    H3Error,
    H3Event
} from 'h3';

export default async (_: H3Error, event: H3Event) => {
    await processResponseEvent(event);
    send(event, 'internal server error'); // Or other error message
};
```

Visit [this page](https://nitro.unjs.io/config#errorhandler) for more information about the error handler.

## Runtime Utils

During runtime, the following utils are available for manipulating the session. Related comments and examples are provided in [this file](./src/runtime/utils.ts).

- clearH3EventContextSession
- deleteH3EventContextSessionStorageData
- getH3EventContextSessionToken
- popH3EventContextSession

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-href]: https://npmjs.com/package/@kikiutils/nitro-session
[npm-version-src]: https://img.shields.io/npm/v/@kikiutils/nitro-session/latest.svg?style=flat&colorA=18181B&colorB=28CF8D

[npm-downloads-href]: https://npmjs.com/package/@kikiutils/nitro-session
[npm-downloads-src]: https://img.shields.io/npm/dm/@kikiutils/nitro-session.svg?style=flat&colorA=18181B&colorB=28CF8D

[license-href]: https://github.com/kikiutils/nitro-session/blob/main/LICENSE
[license-src]: https://img.shields.io/npm/l/@kikiutils/nitro-session.svg?style=flat&colorA=18181B&colorB=28CF8D
