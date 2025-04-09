import type { CookieSerializeOptions } from 'cookie-es';
import {
    deleteCookie,
    getCookie,
    setCookie,
} from 'h3';
import type { H3Event } from 'h3';
import {
    merge,
    omit,
} from 'lodash-es';

import type { TokenStorageOptions } from '../../types/options';

export class CookieTokenHandler {
    #name: string;
    #serializeOptions: CookieSerializeOptions;

    constructor(options: TokenStorageOptions.Cookie['options'], maxAge: number) {
        this.#name = options?.name || 'session';
        this.#serializeOptions = {
            ...merge(
                {
                    httpOnly: true,
                    path: '/',
                    sameSite: 'lax',
                    secure: true,
                },
                omit(options, 'name'),
            ),
            maxAge,
        };
    }

    delete(event: H3Event) {
        deleteCookie(event, this.#name, this.#serializeOptions);
    }

    get(event: H3Event) {
        return getCookie(event, this.#name);
    }

    set(event: H3Event, value: string) {
        setCookie(event, this.#name, value, this.#serializeOptions);
    }
}
