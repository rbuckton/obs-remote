/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Event, EventListener } from "@esfx/events";
import { DependencyList, useEffect } from "react";
import { TypedEventEmitter, TypedEventListener, TypedEventNames } from "../../core/common/events";
import { useEventCallback } from "./useEventCallback";

/**
 * Hook an {@link Event}, unsubscribing when a dependency changes or the component unmounts.
 */
export function useEvent<F extends (...args: any[]) => void>(event: Event<F>, callback: EventListener<F>, deps?: DependencyList): void;
export function useEvent<T extends TypedEventEmitter, K extends TypedEventNames<T>>(emitter: T, type: K, listener: TypedEventListener<T, K>, deps?: DependencyList): void;
export function useEvent(...args: Parameters<typeof useEventOverload> | Parameters<typeof useEventEmitterOverload>) {
    return isUseEventOverload(args) ? 
        useEventOverload(...args) :
        useEventEmitterOverload(...args);
}

function isUseEventOverload(args: Parameters<typeof useEventOverload> | Parameters<typeof useEventEmitterOverload>): args is Parameters<typeof useEventOverload> {
    return typeof args[1] === "function";
}

function useEventOverload<F extends (...args: any[]) => void>(event: Event<F>, listener: EventListener<F>, deps: DependencyList = []): void {
    // state
    listener = useEventCallback(listener);

    // behavior
    // <none>

    // effects
    useEffect(() => {
        event.on(listener);
        return () => { event.off(listener); };
    }, [event, listener, ...deps]);
}

function useEventEmitterOverload<T extends TypedEventEmitter, K extends TypedEventNames<T>>(emitter: T, type: K, listener: TypedEventListener<T, K>, deps: DependencyList = []): void {
    // state
    listener = useEventCallback(listener);

    // behavior
    // <none>
    
    // effects
    useEffect(() => {
        emitter.on(type, listener);
        return () => { emitter.off(type, listener); };
    }, [emitter, type, listener, ...deps]);
}