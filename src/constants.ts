import type { DataHandler } from './handlers/data';

export const cachedHandlers: { data?: DataHandler } = {};
export const defaultOptions = Object.freeze({
    enabled: true,
    maxAge: 86400,
    persistSessionOnError: true,
    storage: {
        data: { driver: 'memory' },
        token: { driver: 'cookie' },
    },
    strictIpValidation: false,
});
