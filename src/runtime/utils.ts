import type { H3Event } from 'h3';
import onChange from 'on-change';

import { cachedHandlers } from '../constants';
import type { PartialH3EventContextSession } from '../types/session';
import { setupH3EventContextSession } from '../utils';

/**
 * Deletes the session storage data associated with the given token.
 *
 * @param {string} token - The token associated with the session data to be deleted.
 * @returns {Promise<void>} - A promise that resolves when the session data is deleted.
 *
 * @example
 * ```typescript
 * // Example usage to delete session storage data
 * await deleteH3EventContextSessionStorageData('your-session-token');
 * ```
 */
export const deleteH3EventContextSessionStorageData = async (token: string) => await cachedHandlers.data?.delete(token);

/**
 * Retrieves the session token from the H3 request event.
 *
 * @param {H3Event} event - The H3 request event object.
 * @returns {string | undefined} - The session token, or undefined if not present.
 *
 * @example
 * ```typescript
 * // Example usage to get the session token in an event handler
 * export default defineEventHandler((event) => {
 *   const sessionToken = getH3EventContextSessionToken(event);
 *   console.log('Session Token:', sessionToken);
 *   // Remaining operations...
 * });
 * ```
 */
export const getH3EventContextSessionToken = (event: H3Event) => event.context._nitroSessionUnstorageKey;

/**
 * Clears the session data in the H3 request event context.
 *
 * Executing this function will not immediately update the session data in storage.
 * The update will occur before the response ends. To clear the data immediately,
 * please use `deleteH3EventContextSessionStorageData`.
 *
 * @param {H3Event} event - The H3 request event object.
 *
 * @example
 * ```typescript
 * // Example usage in an event handler to clear the session
 * export default defineEventHandler((event) => {
 *   clearH3EventContextSession(event);
 *   // Remaining operations...
 * });
 * ```
 */
export function clearH3EventContextSession(event: H3Event) {
    onChange.unsubscribe(event.context.session);
    event.context._nitroSessionChanged = event.context._nitroSessionCleared = true;
    setupH3EventContextSession(event, {}, (event) => delete event.context._nitroSessionCleared);
}

/**
 * Removes and returns a value from the session context in the H3 request event.
 *
 * This function retrieves the value associated with the specified key from the session context,
 * deletes the key-value pair from the session, and returns the value.
 *
 * @param {H3Event} event - The H3 request event object.
 * @param {K} key - The key of the session context property to be removed and returned.
 * @returns {PartialH3EventContextSession[K]}
 * The value associated with the specified key, or undefined if the key does not exist.
 *
 * @example
 * ```typescript
 * // Example usage to pop a value from the session context
 * export default defineEventHandler((event) => {
 *   const userId = popH3EventContextSession(event, 'userId');
 *   console.log('Popped User ID:', userId);
 *   // Remaining operations...
 * });
 * ```
 */
export function popH3EventContextSession<K extends keyof PartialH3EventContextSession>(event: H3Event, key: K) {
    const value = event.context.session[key];
    delete event.context.session[key];
    return value;
}
