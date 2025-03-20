import type { NitroApp as NitroAppA } from 'nitro/types';
// @ts-expect-error Ignore this error.
import type { NitroApp as NitroAppB } from 'nitropack';
// @ts-expect-error Ignore this error.
import type { NitroApp as NitroAppD } from 'nitropack-nightly/types';
// @ts-expect-error Ignore this error.
import type { NitroApp as NitroAppC } from 'nitropack/types';

import type { PluginOptions } from './options';
import type { IfElse } from './utils';

export type NitroApp = IfElse<
    unknown,
    NitroAppA,
    IfElse<
        unknown,
        NitroAppB,
        IfElse<
            unknown,
            NitroAppC,
            NitroAppD,
            NitroAppC
        >,
        NitroAppB
    >,
    NitroAppA
>;

declare module 'nitro/types' {
    export interface NitroRuntimeConfig {
        nitroSession?: PluginOptions;
    }
}

// @ts-expect-error Ignore this error.
declare module 'nitropack' {
    export interface NitroRuntimeConfig {
        nitroSession?: PluginOptions;
    }
}

// @ts-expect-error Ignore this error.
declare module 'nitropack/types' {
    export interface NitroRuntimeConfig {
        nitroSession?: PluginOptions;
    }
}

// @ts-expect-error Ignore this error.
declare module 'nitropack-nightly/types' {
    export interface NitroRuntimeConfig {
        nitroSession?: PluginOptions;
    }
}
