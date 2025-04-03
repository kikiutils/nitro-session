import type { CookieSerializeOptions } from 'cookie-es';
import type { AesCipherEncodingOptions } from 'node-ciphers';
import type { AzureAppConfigurationOptions } from 'unstorage/drivers/azure-app-configuration';
import type { AzureCosmosOptions } from 'unstorage/drivers/azure-cosmos';
import type { AzureKeyVaultOptions } from 'unstorage/drivers/azure-key-vault';
import type { AzureStorageBlobOptions } from 'unstorage/drivers/azure-storage-blob';
import type { AzureStorageTableOptions } from 'unstorage/drivers/azure-storage-table';
import type { KVOptions as CloudflareKVOptions } from 'unstorage/drivers/cloudflare-kv-binding';
import type { KVHTTPOptions as CloudflareKVHTTPOptions } from 'unstorage/drivers/cloudflare-kv-http';
import type { CloudflareR2Options } from 'unstorage/drivers/cloudflare-r2-binding';
import type { FSStorageOptions } from 'unstorage/drivers/fs';
import type { FSStorageOptions as FSLiteStorageOptions } from 'unstorage/drivers/fs-lite';
import type { HTTPOptions } from 'unstorage/drivers/http';
import type { LRUDriverOptions } from 'unstorage/drivers/lru-cache';
import type { MongoDbOptions } from 'unstorage/drivers/mongodb';
import type { NetlifyStoreOptions } from 'unstorage/drivers/netlify-blobs';
import type { PlanetscaleDriverOptions } from 'unstorage/drivers/planetscale';
import type { RedisOptions } from 'unstorage/drivers/redis';
import type { VercelKVOptions } from 'unstorage/drivers/vercel-kv';

export type DataStorageOptions =
  | DataStorageOptions.CookieOrHeader
  | (
        UseUnstorageDataStorageOptions &
        (
          | DataStorageOptions.AzureAppConfiguration
          | DataStorageOptions.AzureCosmos
          | DataStorageOptions.AzureKeyVault
          | DataStorageOptions.AzureStorageBlob
          | DataStorageOptions.AzureStorageTable
          | DataStorageOptions.CloudflareKV
          | DataStorageOptions.CloudflareKVHTTP
          | DataStorageOptions.CloudflareR2
          | DataStorageOptions.Fs
          | DataStorageOptions.FsLite
          | DataStorageOptions.HTTP
          | DataStorageOptions.LruCache
          | DataStorageOptions.Memory
          | DataStorageOptions.MongoDB
          | DataStorageOptions.NetlifyStore
          | DataStorageOptions.PlanetscaleDriver
          | DataStorageOptions.Redis
          | DataStorageOptions.VercelKV
        )
    );

export type TokenStorageOptions = TokenStorageOptions.Cookie | TokenStorageOptions.Header;

export interface PluginOptions {
    /**
     * @default true
     */
    enabled?: boolean;

    /**
     * Session expiration time in seconds.
     *
     * If the token driver is set to cookie, this value will be used as the `maxAge` option for the cookie.
     *
     * @default 86400
     */
    maxAge?: number;

    /**
     * If true, the session changes will be persisted even if an error occurs during the request.
     *
     * This ensures that any modifications to the session are not lost due to an error,
     * and they will be saved regardless of whether the request completes successfully.
     *
     * @default true
     */
    // persistSessionOnError?: boolean;

    /**
     * Options for storing session data and token.
     */
    storage?: {
        /**
         * @default { driver: 'memory' }
         */
        data?: DataStorageOptions;

        /**
         * @default { driver: 'cookie' }
         */
        token?: TokenStorageOptions;
    };

    /**
     * If true, the request's IP address will be compared to the IP address stored in the session.
     *
     * If the IP addresses do not match, the session will be considered invalid (similar to session expiration).
     *
     * If false, the IP address check will be skipped.
     *
     * @default false
     */
    strictIpValidation?: boolean;
}

interface UseUnstorageDataStorageOptions {
    /**
     * Options related to keys for storing data in unstorage drivers.
     */
    key?: {
        /**
         * For security reasons, this value must not be less than 24.
         *
         * @default 24
         */
        length?: number;

        /**
         * @default 'session'
         */
        prefix?: string;
    };
}

// eslint-disable-next-line ts/no-namespace
export namespace DataStorageOptions {
    export interface AzureAppConfiguration {
        driver: 'azure-app-configuration';
        options: AzureAppConfigurationOptions;
    }

    export interface AzureCosmos {
        driver: 'azure-cosmos';
        options: AzureCosmosOptions;
    }

    export interface AzureKeyVault {
        driver: 'azure-key-vault';
        options: AzureKeyVaultOptions;
    }

    export interface AzureStorageBlob {
        driver: 'azure-storage-blob';
        options: AzureStorageBlobOptions;
    }

    export interface AzureStorageTable {
        driver: 'azure-storage-table';
        options: AzureStorageTableOptions;
    }

    export interface CloudflareKV {
        driver: 'cloudflare-kv-binding';
        options: CloudflareKVOptions;
    }

    export interface CloudflareKVHTTP {
        driver: 'cloudflare-kv-http';
        options: CloudflareKVHTTPOptions;
    }

    export interface CloudflareR2 {
        driver: 'cloudflare-r2-binding';
        options?: CloudflareR2Options;
    }

    export interface CookieOrHeader {
        driver: 'cookie/header';

        /**
         * Options for data encryption and decryption.
         */
        options: {
            /**
             * The encoding used for encryption, decryption, and handling keys.
             *
             * @default
             * {
             *   decryptInput: 'base64',
             *   decryptOutput: 'utf-8',
             *   encryptInput: 'utf-8',
             *   encryptOutput: 'base64',
             *   key: 'utf-8',
             *   iv: 'base64'
             * }
             */
            encodingOptions?: AesCipherEncodingOptions;
            encryptionMode?: 'cbc' | 'cfb1' | 'cfb8' | 'cfb' | 'ctr' | 'ofb';

            /**
             * The key used for encryption, with a length of 16, 24, or 32 bytes.
             *
             * The byte length may vary with the same input depending on the encoding type set in `encodingOptions.key`.
             */
            key: string;
        };
    }

    export interface Fs {
        driver: 'fs';
        options?: FSStorageOptions;
    }

    export interface FsLite {
        driver: 'fs-lite';
        options?: FSLiteStorageOptions;
    }

    export interface HTTP {
        driver: 'http';
        options: HTTPOptions;
    }

    export interface LruCache {
        driver: 'lru-cache';
        options?: LRUDriverOptions;
    }

    export interface Memory {
        driver: 'memory';
    }

    export interface MongoDB {
        driver: 'mongodb';
        options: MongoDbOptions;
    }

    export interface NetlifyStore {
        driver: 'netlify-blobs';
        options: NetlifyStoreOptions;
    }

    export interface PlanetscaleDriver {
        driver: 'planetscale';
        options: PlanetscaleDriverOptions;
    }

    export interface Redis {
        driver: 'redis';
        options?: RedisOptions;
    }

    export interface VercelKV {
        driver: 'vercel-kv';
        options: VercelKVOptions;
    }
}

// eslint-disable-next-line ts/no-namespace
export namespace TokenStorageOptions {
    export interface Cookie {
        driver: 'cookie';
        /**
         * @default
         * {
         *   httpOnly: true,
         *   name: 'session',
         *   path: '/',
         *   sameSite: 'lax',
         *   secure: true
         * }
         */
        options?: CookieSerializeOptions & {
            /**
             * The cookie name for storing the token.
             *
             * @default 'session'
             */
            name?: string;
        };
    }

    export interface Header {
        driver: 'header';
        options?: {
            /**
             * The key for retrieving the token header when receiving a request.
             *
             * @default 'session'
             */
            name?: string;

            /**
             * The key for setting the token header when returning a response.
             *
             * @default 'set-session'
             */
            setName?: string;
        };
    }
}
