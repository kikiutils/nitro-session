import { Buffer } from 'node:buffer';

import type { H3Event } from 'h3';
import { AesCiphers } from 'node-ciphers';

import type { DataStorageOptions } from '../../types/options';

import type { StoredData } from './';

export class CookieOrHeaderDataHandler {
    #cipher: AesCiphers.Cbc | AesCiphers.Cfb | AesCiphers.Cfb1 | AesCiphers.Cfb8 | AesCiphers.Ctr | AesCiphers.Ofb;

    constructor(options?: DataStorageOptions.CookieOrHeader['options']) {
        const aesModeToCipherClassMap = {
            cbc: AesCiphers.Cbc,
            cfb: AesCiphers.Cfb,
            cfb1: AesCiphers.Cfb1,
            cfb8: AesCiphers.Cfb8,
            ctr: AesCiphers.Ctr,
            ofb: AesCiphers.Ofb,
        } as const;

        if (options?.encryptionMode && !aesModeToCipherClassMap[options.encryptionMode]) {
            throw new Error(`Invalid cookie/header data encryption mode: ${options.encryptionMode}`);
        }

        if (!options?.key) throw new Error('No cookie/header data encryption key provided');
        const isKeyLengthValid = [
            16,
            24,
            32,
        ].includes(Buffer.from(options.key, options.encodingOptions?.key).byteLength);
        if (!isKeyLengthValid) throw new Error('Invalid cookie/header data encryption key length');
        this.#cipher = new aesModeToCipherClassMap[options.encryptionMode || 'ctr'](
            options.key,
            Object.assign(
                {
                    decryptInput: 'base64',
                    encryptOutput: 'base64',
                    iv: 'base64',
                },
                options.encodingOptions,
            ),
        );
    }

    delete(_: string) {}

    get(_: H3Event, token: string) {
        const separatorIndex = token.lastIndexOf(':');
        if (separatorIndex === -1) return;
        return this.#cipher.decryptToJson<StoredData>(token.slice(0, separatorIndex), token.slice(separatorIndex + 1));
    }

    setOrProcessAndGetToken(_: H3Event, data: StoredData) {
        const encryptResult = this.#cipher.encryptJson(data);
        if (encryptResult) return `${encryptResult.data}:${encryptResult.iv}`;
    }
}

export default CookieOrHeaderDataHandler;
