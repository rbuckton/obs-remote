/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { CancelToken } from "@esfx/async-canceltoken";
import { DependencyList, useCallback, useEffect, useMemo } from "react";

export interface CancelableCallback<A extends any[], T> {
    (...args: A): T;
    bindToken: (token: CancelToken) => (...args: A) => T;
    cancelable: (token: CancelToken, ...args: A) => T;
}

export interface UseAsyncCallbackOptions {
    propagateErrors?: boolean;
}

/**
 * Wraps an async function, passing in a cancellation token that is signaled when the component unmounts.
 */
export function useAsyncCallback<A extends any[], T>(f: (token: CancelToken, ...args: A) => Promise<T>, deps: DependencyList | undefined, options: UseAsyncCallbackOptions & { propagateErrors: true }): CancelableCallback<A, Promise<T>>;
/**
 * Wraps an async function, passing in a cancellation token that is signaled when the component unmounts.
 * If {@link UseAsyncCallbackOptions.propagateErrors `options.propagateErrors`} is false or not provided, any errors are caught and reported to the console.
 */
export function useAsyncCallback<A extends any[], T>(f: (token: CancelToken, ...args: A) => Promise<T>, deps?: DependencyList, options?: UseAsyncCallbackOptions): CancelableCallback<A, Promise<T | undefined>>;
export function useAsyncCallback<A extends any[], T>(f: (token: CancelToken, ...args: A) => Promise<T>, deps: DependencyList = [], options?: UseAsyncCallbackOptions): CancelableCallback<A, Promise<T | undefined>> {
    // state
    const cancelable = useCancelableAsyncCallback(f, deps);
    const callback = useCallback((...args: A) => cancelable(/*token*/ undefined, ...args), [cancelable]);
    const bindToken = useCallback((token: CancelToken) => useCallback((...args: A) => cancelable(token, ...args), [cancelable, token]), [cancelable]);

    // behavior
    // <none>

    // effects
    // <none>

    return useMemo(() =>  Object.assign(callback, { cancelable, bindToken }), [cancelable]);
}

/**
 * Wraps an async function, catching any errors and reporting them to the console.
 */
function useCancelableAsyncCallback<A extends any[], T>(f: (token: CancelToken, ...args: A) => Promise<T>, deps: DependencyList = [], options?: UseAsyncCallbackOptions): (token: CancelToken | undefined, ...args: A) => Promise<T | undefined> {
    // source is created when the component is mounted, and canceled when the component is unmounted.

    // state
    const propagateErrors = options?.propagateErrors ?? false;
    const source = useMemo(() => CancelToken.source(), deps);

    // behavior
    // <none>

    // effects
    useEffect(() => () => source.cancel(), deps);

    return useCallback(async (token, ...args) => {
        token = token ? CancelToken.race([token, source.token]) : source.token;
        if (propagateErrors) {
            return await f(token, ...args);
        }
        try {
            return await f(token, ...args);
        }
        catch (e) {
            console.error(e);
        }
    }, [propagateErrors, ...deps]);
}
