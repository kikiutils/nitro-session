import type { H3Event } from 'h3';
import onChange from 'on-change';

import type { PartialH3EventContextSession } from './types/session';

const _interopDefaultCompat = (e: any) => e && typeof e === 'object' && 'default' in e ? e.default : e;
export const importModule = async (name: string) => _interopDefaultCompat(await import(name));

export function setupH3EventContextSession(
    event: H3Event,
    sessionData: PartialH3EventContextSession,
    onChangeCallback?: (event: H3Event) => void,
) {
    event.context.session = onChange(
        sessionData,
        () => {
            event.context._nitroSessionChanged = true;
            onChange.unsubscribe(event.context.session);
            onChangeCallback?.(event);
        },
        { ignoreSymbols: true },
    );
}
