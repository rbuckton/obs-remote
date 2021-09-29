import { DependencyList, useEffect } from "react";
import { CancelToken } from "@esfx/async-canceltoken";
import { useAsyncCallback } from "./useAsyncCallback";

/**
 * Accepts an async function that contains imperative, possibly effectful code.
 *
 * @param effect Imperative async function that can accept a cancellation token to use for cleanup.
 * @param deps If present, effect will only activate if the values in the list change.
 */
export function useAsyncEffect(callback: (token: CancelToken) => Promise<void>, deps?: DependencyList) {
    useEffect(() => {
        const source = CancelToken.source();
        useAsyncCallback(callback)(source.token);
        return () => source.cancel();
    }, deps);
}