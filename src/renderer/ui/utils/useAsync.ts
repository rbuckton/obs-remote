import { DependencyList, useEffect, useLayoutEffect } from "react";
import { CancelToken } from "@esfx/async-canceltoken";

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

export function useAsyncEffect(callback: (token: CancelToken) => Promise<void>, deps?: DependencyList) {
    useEffect(() => {
        const source = CancelToken.source();
        useAsyncCallback(callback)(source.token);
        return () => source.cancel();
    }, deps);
}

export function useAsyncLayoutEffect(callback: (token: CancelToken) => Promise<void>, deps?: DependencyList) {
    useLayoutEffect(() => {
        const source = CancelToken.source();
        useAsyncCallback(callback)(source.token);
        return () => source.cancel();
    }, deps);
}