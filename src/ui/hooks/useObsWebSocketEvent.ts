import { Disposable } from "@esfx/disposable";
import React, { useEffect, useRef } from "react";
import { ObsWebSocketEventArgsList, ObsWebSocketEvents } from "../../obs/common/protocol";
import { useAppContext } from "../utils/context";

export function useObsWebSocketEvent<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void, deps: React.DependencyList = []) {
    // state
    const listenerRef = useRef<typeof listener>();
    const { obs } = useAppContext();
    
    // effects

    // Update listenerRef if listener changes but dependencies don't.
    useEffect(() => { listenerRef.current = listener; }, [listener]);

    // Update subscription on dependency changes.
    useEffect(() => {
        const wrapper: typeof listener = (...args) => listenerRef.current!(...args);
        obs.on(type, wrapper);
        return () => { obs.off(type, wrapper); };
    }, [obs, type, ...deps]);
}
