import { getRequestIP } from 'h3';
import type { H3Event } from 'h3';

import type { PluginOptions } from '../../types/options';
import type { PartialH3EventContextSession } from '../../types/session';

import { CookieOrHeaderDataHandler } from './cookie-or-header';
import { UnstorageDataHandler } from './unstorage';

export type StoredData = [number, PartialH3EventContextSession, ip?: string];

export class DataHandler {
    #handler: CookieOrHeaderDataHandler | UnstorageDataHandler;
    #maxAgeMilliseconds: number;
    #strictIpValidation: boolean;

    private constructor(
        handler: CookieOrHeaderDataHandler | UnstorageDataHandler,
        maxAge: number,
        strictIpValidation: boolean,
    ) {
        this.#handler = handler;
        this.#maxAgeMilliseconds = maxAge * 1000;
        this.#strictIpValidation = strictIpValidation;
    }

    #getRequestIp(event: H3Event) {
        return getRequestIP(event, { xForwardedFor: true }) || getRequestIP(event);
    }

    static async createInstance(options: PluginOptions) {
        let handler;
        if (options.storage?.data?.driver === 'cookie/header') {
            handler = new CookieOrHeaderDataHandler(options.storage.data.options);
        } else handler = await UnstorageDataHandler.createInstance(options.storage?.data || { driver: 'memory' });
        return new this(handler, options.maxAge ?? 86400, !!options.strictIpValidation);
    }

    async delete(token: string) {
        await this.#handler.delete(token);
    }

    async get(event: H3Event, token: string) {
        const data = await this.#handler.get(event, token);
        if (data && data[0] + this.#maxAgeMilliseconds >= Date.now()) {
            if (this.#strictIpValidation && this.#getRequestIp(event) !== data[2]) return;
            return data[1];
        }
    }

    async setAndGetToken(event: H3Event, data: PartialH3EventContextSession) {
        const toSetData: StoredData = [
            Date.now(),
            data,
        ];

        if (this.#strictIpValidation) toSetData.push(this.#getRequestIp(event));
        return await this.#handler.setOrProcessAndGetToken(event, toSetData);
    }
}
