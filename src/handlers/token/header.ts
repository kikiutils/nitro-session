import {
    getHeader,
    setHeader,
} from 'h3';
import type { H3Event } from 'h3';

import type { TokenStorageOptions } from '../../types/options';

export class HeaderTokenHandler {
    #name: string;
    #setName: string;

    constructor(options: TokenStorageOptions.Header['options']) {
        this.#name = options?.name || 'session';
        this.#setName = options?.setName || 'set-session';
    }

    delete(event: H3Event) {
        setHeader(event, this.#setName, '');
    }

    get(event: H3Event) {
        return getHeader(event, this.#name);
    }

    set(event: H3Event, value: string) {
        setHeader(event, this.#setName, value);
    }
}
