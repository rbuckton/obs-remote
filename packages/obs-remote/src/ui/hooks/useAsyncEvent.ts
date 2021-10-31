/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { CancelToken } from "@esfx/async-canceltoken";
import { Event } from "@esfx/events";
import { DependencyList, useEffect } from "react";
import { TypedEventArgsList, TypedEventEmitter, TypedEventNames } from "../../core/common/events";
import { useAsyncEventCallback } from "./useAsyncEventCallback";

export type AsyncEventListener<F extends (...args: any[]) => void> = (this: ThisParameterType<F>, token: CancelToken, ...args: Parameters<F>) => Promise<void>;
export type AsyncTypedEventListener<T extends TypedEventEmitter, K extends TypedEventNames<T> | string | symbol> = (token: CancelToken, ...args: TypedEventArgsList<T, K>) => Promise<void>;

/**
 * Hook an {@link Event}, unsubscribing when a dependency changes or the component unmounts.
 */
export function useAsyncEvent<F extends (...args: any[]) => void>(event: Event<F>, callback: AsyncEventListener<F>, deps?: DependencyList): void;
export function useAsyncEvent<T extends TypedEventEmitter, K extends TypedEventNames<T>>(emitter: T, type: K, listener: AsyncTypedEventListener<T, K>, deps?: DependencyList): void;
export function useAsyncEvent(...args: Parameters<typeof useAsyncEventOverload> | Parameters<typeof useAsyncEventEmitterOverload>) {
    return isUseAsyncEventOverload(args) ?
        useAsyncEventOverload(...args) :
        useAsyncEventEmitterOverload(...args);
}

function isUseAsyncEventOverload(args: Parameters<typeof useAsyncEventOverload> | Parameters<typeof useAsyncEventEmitterOverload>): args is Parameters<typeof useAsyncEventOverload> {
    return typeof args[1] === "function";
}

function useAsyncEventOverload<F extends (...args: any[]) => void>(event: Event<F>, listener: AsyncEventListener<F>, deps: DependencyList = []) {
    // state
    const asyncListener = useAsyncEventCallback(listener);

    // behavior
    // <none>

    // effects
    useEffect(() => {
        event.on(asyncListener);
        return () => { event.off(asyncListener); };
    }, [event, asyncListener, ...deps]);
}

function useAsyncEventEmitterOverload<T extends TypedEventEmitter, K extends TypedEventNames<T>>(emitter: T, type: K, listener: AsyncTypedEventListener<T, K>, deps: DependencyList = []): void {
    // state
    const asyncListener = useAsyncEventCallback(listener);

    // behavior
    // <none>

    // effects
    useEffect(() => {
        emitter.on(type, asyncListener);
        return () => { emitter.off(type, asyncListener); };
    }, [emitter, asyncListener, ...deps]);
}
