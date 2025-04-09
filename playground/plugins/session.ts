import { nitroSession } from '../../src';

export default defineNitroPlugin((nitroApp) => nitroSession(nitroApp, useRuntimeConfig().nitroSession));
