export interface PrivateField<T extends object, V = unknown> {
    get name(): string;
    get description(): string;
    has(obj: T): boolean;
    get(obj: T): V;
    set<U extends V = V>(obj: T, value: U): U;
    define<U extends T>(obj: U): U;
}

export interface PrivateFieldConstructor {
    new <T extends object, V = unknown>(name?: string): PrivateField<T, V | undefined>;
    new <T extends object, V = unknown>(initializer: (this: T) => V): PrivateField<T, V>;
    new <T extends object, V = unknown>(name: string | undefined, initializer: (this: T) => V): PrivateField<T, V>;
    prototype: PrivateField<any, any>;
}

export const PrivateField: PrivateFieldConstructor = class PrivateField<T extends object, V> {
    #installer;
    #name: string;
    #description: string;
    #has!: (obj: T) => boolean;
    #get!: (obj: T) => V;
    #set!: <U extends V>(obj: T, value: U) => U;

    constructor(description?: string | ((this: T) => V), initializer?: (this: T) => V) {
        if (typeof description === "function") {
            initializer = description;
            description = undefined;
        }

        this.#description = description || "";
        this.#name = description === undefined ? "#<anonymous>" :
            /^[$_\p{ID_Start}][$_\p{ID_Continue}]*$/u.test(description) ? `#${description}` :
            `#<${JSON.stringify(description)}>`;

        this.#installer = class extends class { constructor(object: object) { return object; } } {
            #dynamicPrivateField = initializer?.call(this as any);
            static createHelpers() {
                // TODO: Use the following after TS 4.5:
                //// self.#has ||= (obj: any) => #dynamicPrivateField in obj;
                const has = (obj: any) => {
                    try {
                        void obj.#dynamicPrivateField;
                        return true;
                    }
                    catch {
                        return false;
                    }
                };
                const get = (obj: any) => obj.#dynamicPrivateField;
                const set = (obj: any, v: any) => obj.#dynamicPrivateField = v;
                return { has, get, set };
            }
        }

        const { has, get, set } = this.#installer.createHelpers();
        this.#has = has;
        this.#get = get;
        this.#set = set;
    }
    
    get name() {
        return this.#name;
    }

    get description() {
        return this.#description;
    }

    has(obj: T) {
        return this.#has(obj);
    }

    get(obj: T) {
        const get = this.#get;
        try {
            return get(obj);
        }
        catch (e: any) {
            if (e instanceof Error) {
                e.message = e.message.replace(/#dynamicPrivateField/g, this.#name);
            }
            throw e;
        }
    }

    set<U extends V>(obj: T, value: U) {
        const set = this.#set;
        try {
            return set(obj, value);
        }
        catch (e: any) {
            if (e instanceof Error) {
                e.message = e.message.replace(/#dynamicPrivateField/g, this.#name);
            }
            throw e;
        }
    }

    define<U extends T>(obj: U): U {
        if (!this.#has(obj)) {
            new this.#installer(obj);
        }
        return obj;
    }

    toString() {
        return `PrivateField(${this.#name})`;
    }
}
