import * as electron from "electron";

const weakRendererOnlyConstructors = new WeakSet<abstract new (...args: any[]) => any>();

export function isRendererOnly(target: abstract new (...args: any[]) => any) {
    if (weakRendererOnlyConstructors.has(target)) return true;
    let proto = Object.getPrototypeOf(target);
    while (typeof proto === "function" && proto) {
        if (weakRendererOnlyConstructors.has(proto)) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

/**
 * Indicates the class can only be instantiated in an electron "renderer" thread.
 * Helps to prevent accidentally using a "renderer"-thread class in a main thread.
 */
export function RendererOnly<TClass extends abstract new (...args: any[]) => any>(target: TClass): TClass {
    if (isRendererOnly(target)) return target;
    weakRendererOnlyConstructors.add(target);
    abstract class _ extends target {
        constructor(...args: any[]) {
            if (!electron.ipcRenderer) throw new TypeError("This class can only be used in an electron render process.");
            super(...args);
        }
    }
    const name = /^render/i.test(target.name) ? target.name : `Renderer${target.name}`;
    Object.defineProperty(_, "name", { ...Object.getOwnPropertyDescriptor(_, "name"), value: name });
    return _;
}
