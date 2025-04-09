import { consola } from 'consola';
import type { H3Event } from 'h3';
import { nanoid } from 'nanoid';
import {
    createStorage,
    prefixStorage,
} from 'unstorage';
import type { Storage } from 'unstorage';

import type { DataStorageOptions } from '../../types/options';
import { importModule } from '../../utils';

import type { StoredData } from './';

export class UnstorageDataHandler {
    #keyLength: number;
    #storage: Storage;

    private constructor(keyLength: number, storage: Storage) {
        this.#keyLength = keyLength;
        this.#storage = storage;
    }

    static async createInstance(options?: Exclude<DataStorageOptions, DataStorageOptions.CookieOrHeader>) {
        const keyLength = options?.key?.length || 24;
        if (keyLength < 24) throw new Error('The unstorage key length must be 24 or more');
        let storage;
        if (!options?.driver || options?.driver === 'memory') {
            storage = createStorage({ driver: (await importModule('unstorage/drivers/memory'))() });
        } else {
            try {
                const driver = await importModule(`unstorage/drivers/${options.driver}`);
                storage = prefixStorage(
                    createStorage({ driver: driver(options.options) }),
                    options.key?.prefix || 'session',
                );
            } catch (error) {
                consola.error(error);
                // eslint-disable-next-line style/max-len
                throw new Error(`Failed to import or create unstorage driver '${options.driver}', please check if the relevant dependency is installed and the driver is supported and set the correct options.`);
            }
        }

        return new this(keyLength, storage);
    }

    delete(key: string) {
        return this.#storage.removeItem(key).catch(consola.error);
    }

    async get(event: H3Event, key: string) {
        try {
            const data = await this.#storage.getItem<StoredData>(key);
            if (data) event.context._nitroSessionUnstorageKey = key;
            return data;
        } catch (error) {
            consola.error(error);
        }
    }

    async setOrProcessAndGetToken(event: H3Event, data: StoredData) {
        try {
            const key = event.context._nitroSessionUnstorageKey ||= nanoid(this.#keyLength);
            await this.#storage.setItem(key, data);
            return key;
        } catch (error) {
            consola.error(error);
        }
    }
}
