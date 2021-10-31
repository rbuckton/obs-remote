/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { CancelToken } from "@esfx/async-canceltoken";
import { DependencyList, useLayoutEffect, useRef } from "react";
import { useAsyncCallback } from "./useAsyncCallback";

/**
 * Gets a stable function for an async event handler callback.
 */
export function useAsyncEventCallback<A extends any[], T>(callback: (token: CancelToken, ...args: A) => Promise<T>, deps: DependencyList = []) {
    // state
    const callbackRef = useRef(callback);

    // behavior
    // <none>

    // effects
    useLayoutEffect(() => { callbackRef.current = callback });

    return useAsyncCallback((token: CancelToken, ...args: A) => (void 0, callbackRef.current)(token, ...args), deps)
}
