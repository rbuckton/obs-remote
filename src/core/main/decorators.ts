import * as electron from "electron";

const weakMainOnlyConstructors = new WeakSet<abstract new (...args: any[]) => any>();

export function isMainOnly(target: abstract new (...args: any[]) => any) {
    if (weakMainOnlyConstructors.has(target)) return true;
    let proto = Object.getPrototypeOf(target);
    while (typeof proto === "function" && proto) {
        if (weakMainOnlyConstructors.has(proto)) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

/**
 * Indicates the class can only be instantiated in an electron "main" thread.
 * Helps to prevent accidentally using a "main"-thread class in a render thread
 */
export function MainOnly<TClass extends abstract new (...args: any[]) => any>(target: TClass): TClass {
    if (isMainOnly(target)) return target;
    weakMainOnlyConstructors.add(target);

    abstract class _ extends target {
        constructor(...args: any[]) {
            if (!electron.ipcMain) throw new TypeError("This class can only be used in the electron main process.");
            super(...args);
        }
    }
    const name = /^main/i.test(target.name) ? target.name : `Main${target.name}`;
    Object.defineProperty(_, "name", { ...Object.getOwnPropertyDescriptor(_, "name"), value: name });
    return _;
}
