/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { isRendererOnly } from "../renderer/decorators";
import { isInMain } from "./main";

const weakMainOnlyConstructors = new WeakSet<abstract new (...args: any[]) => any>();

/**
 * Indicates the class can only be instantiated in an electron "main" thread.
 * Helps to prevent accidentally using a "main"-thread class in a render thread
 */
export function MainOnly<TClass extends abstract new (...args: any[]) => any>(target: TClass): TClass {
    if (isMainOnly(target)) return target;
    if (isRendererOnly(target)) throw new TypeError("Class cannot be marked both @MainOnly and @RendererOnly");

    weakMainOnlyConstructors.add(target);

    abstract class _ extends target {
        constructor(...args: any[]) {
            if (!isInMain()) throw new TypeError("This class can only be used in the electron main process.");
            super(...args);
        }
    }

    const name = /^main/i.test(target.name) ? target.name : `Main${target.name}`;
    Object.defineProperty(_, "name", { ...Object.getOwnPropertyDescriptor(_, "name"), value: name });
    return _;
}

/**
 * Tests whether a class has been marked with the {@link MainOnly} decorator.
 */
export function isMainOnly(target: abstract new (...args: any[]) => any) {
    if (weakMainOnlyConstructors.has(target)) return true;
    let proto = Object.getPrototypeOf(target);
    while (typeof proto === "function") {
        if (weakMainOnlyConstructors.has(proto)) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}
