export module Util {
    /**
     * Useful for generating random contact identifiers
     * for people we don't have in our phones contact list.
     */
    export function generateRandomId(): string {
        return Math.random().toString(36).substring(2)
            + (new Date()).getTime().toString(36);
    }
}