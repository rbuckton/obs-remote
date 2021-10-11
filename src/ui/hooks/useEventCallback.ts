/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { DependencyList, useCallback, useLayoutEffect, useRef } from "react";

/**
 * Gets a stable function for an event handler callback.
 */
export function useEventCallback<A extends any[], T>(callback: (...args: A) => T, deps: DependencyList = []): (...args: A) => T {
    // state
    const callbackRef = useRef(callback);

    // behavior
    // <none>

    // effects
    useLayoutEffect(() => { callbackRef.current = callback });

    return useCallback((...args) => (void 0, callbackRef.current)(...args), deps)
}
