/**
 * Wraps an async function, catching any errors and reporting them to the console.
 */
export function useAsyncCallback<A extends any[]>(f: (...args: A) => Promise<void>): (...args: A) => Promise<void> {
    return async (...args: A) => {
        try {
            await f(...args);
        }
        catch (e) {
            console.error(e);
        }
    };
}
