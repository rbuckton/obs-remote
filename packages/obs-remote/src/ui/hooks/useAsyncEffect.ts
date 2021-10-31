/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { CancelToken } from "@esfx/async-canceltoken";
import { DependencyList, useEffect } from "react";

/**
 * Accepts an async function that contains imperative, possibly effectful code.
 *
 * @param effect Imperative async function that can accept a cancellation token to use for cleanup.
 * @param deps If present, effect will only activate if the values in the list change.
 */
export function useAsyncEffect(callback: (token: CancelToken) => Promise<void>, deps?: DependencyList) {
    useEffect(() => {
        const source = CancelToken.source();
        const wrapper = async (token: CancelToken) => {
            try {
                await callback(token);
            }
            catch (e) {
                console.error(e);
            }
        }
        wrapper(source.token);
        return () => source.cancel();
    }, deps);
}
