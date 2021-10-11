/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { createContext, useContext } from "react";
import { IServiceProvider } from "service-composition";

export interface CompositionContext {
    get serviceProvider(): IServiceProvider;
}

export const CompositionContext = createContext<CompositionContext>({
    get serviceProvider(): IServiceProvider { throw new Error("Not implemented."); }
});

export interface CompositionContextOptions {
    serviceProvider: IServiceProvider;
}

export function createCompositionContext({ serviceProvider }: CompositionContextOptions): CompositionContext {
    return { serviceProvider };
}

export function useCompositionContext() {
    return useContext(CompositionContext);
}
