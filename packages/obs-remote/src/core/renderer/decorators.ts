/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { isInRenderer } from "./renderer";

const weakRendererOnlyConstructors = new WeakSet<abstract new (...args: any[]) => any>();

/**
 * Indicates the class can only be instantiated in an electron "renderer" thread.
 * Helps to prevent accidentally using a "renderer"-thread class in a main thread.
 */
export function RendererOnly<TClass extends abstract new (...args: any[]) => any>(target: TClass): TClass {
    if (isRendererOnly(target)) return target;
    if (isRendererOnly(target)) throw new TypeError("Class cannot be marked both @MainOnly and @RendererOnly");

    weakRendererOnlyConstructors.add(target);

    abstract class _ extends target {
        constructor(...args: any[]) {
            if (!isInRenderer()) throw new TypeError("This class can only be used in an electron render process.");
            super(...args);
        }
    }

    const name = /^render/i.test(target.name) ? target.name : `Renderer${target.name}`;
    Object.defineProperty(_, "name", { ...Object.getOwnPropertyDescriptor(_, "name"), value: name });
    return _;
}

/**
 * Tests whether a class has been marked with the {@link RendererOnly} decorator.
 */
 export function isRendererOnly(target: abstract new (...args: any[]) => any) {
    if (weakRendererOnlyConstructors.has(target)) return true;
    let proto = Object.getPrototypeOf(target);
    while (typeof proto === "function") {
        if (weakRendererOnlyConstructors.has(proto)) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}
