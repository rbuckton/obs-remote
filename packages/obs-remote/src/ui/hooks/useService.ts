/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ServiceIdentifier } from "service-composition";
import { useCompositionContext } from "../utils/compositionContext";

export function useServices<T>(id: ServiceIdentifier<T>): T[] {
    const { serviceProvider } = useCompositionContext();
    return serviceProvider.getServices(id);
}

export function useService<T>(id: ServiceIdentifier<T>): T {
    const { serviceProvider } = useCompositionContext();
    return serviceProvider.getService(id);
}

export function useOptionalService<T>(id: ServiceIdentifier<T>): T | undefined {
    const { serviceProvider } = useCompositionContext();
    return serviceProvider.tryGetService(id);
}
