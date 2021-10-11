import { EventEmitter } from "events";

export declare const EVENTS: unique symbol;
export type EVENTS = typeof EVENTS;

export type TypedEventMapOf<T extends TypedEventEmitter> = T[EVENTS];
export type TypedEventNames<T extends TypedEventEmitter> = Extract<keyof TypedEventMapOf<T>, string | symbol>;
export type TypedEventFunctionDescriptor<A extends any[]> = (...args: A) => void;
export type TypedEventArrayDescriptor<A extends any[]> = A;
export type TypedEventObjectDescriptor<A> = { eventArgs: A; };

export type TypedEventArgsList<T extends TypedEventEmitter, K extends TypedEventNames<T> | string | symbol> = Extract<
    K extends TypedEventNames<T> ?
        TypedEventMapOf<T>[K] extends TypedEventFunctionDescriptor<infer A> ? A :
        TypedEventMapOf<T>[K] extends TypedEventArrayDescriptor<infer A> ? A :
        TypedEventMapOf<T>[K] extends TypedEventObjectDescriptor<infer A> ? [A] extends [void] ? [] : [A] :
        any[] :
    any[],
    readonly any[]
>;

export type TypedEventListener<T extends TypedEventEmitter, K extends TypedEventNames<T> | string | symbol> = (...args: TypedEventArgsList<T, K>) => void;

export type TypedEventsBase<E> = {
    [P in keyof E]: 
        | TypedEventFunctionDescriptor<any[]>
        | TypedEventArrayDescriptor<any[]>
        | TypedEventObjectDescriptor<any>;
};

export type WithEvents<T extends TypedEventEmitter, E extends TypedEventsBase<E>> = T & {
    [EVENTS]: Omit<TypedEventMapOf<T>, keyof E> & E;
};

export interface TypedEventEmitter extends NodeJS.EventEmitter {
    [EVENTS]: any;

    addListener<K extends TypedEventNames<this>>(type: K, listener: TypedEventListener<this, K>): this;
    addListener<K extends string | symbol>(type: K, listener: TypedEventListener<this, K>): this;
    on<K extends TypedEventNames<this>>(type: K, listener: TypedEventListener<this, K>): this;
    on<K extends string | symbol>(type: K, listener: TypedEventListener<this, K>): this;
    once<K extends TypedEventNames<this>>(type: K, listener: TypedEventListener<this, K>): this;
    once<K extends string | symbol>(type: K, listener: TypedEventListener<this, K>): this;
    removeListener<K extends TypedEventNames<this>>(type: K, listener: TypedEventListener<this, K>): this;
    removeListener<K extends string | symbol>(type: K, listener: TypedEventListener<this, K>): this;
    off<K extends TypedEventNames<this>>(type: K, listener: TypedEventListener<this, K>): this;
    off<K extends string | symbol>(type: K, listener: TypedEventListener<this, K>): this;
    prependListener<K extends TypedEventNames<this>>(type: K, listener: TypedEventListener<this, K>): this;
    prependListener<K extends string | symbol>(type: K, listener: TypedEventListener<this, K>): this;
    prependOnceListener<K extends TypedEventNames<this>>(type: K, listener: TypedEventListener<this, K>): this;
    prependOnceListener<K extends string | symbol>(type: K, listener: TypedEventListener<this, K>): this;
    emit<K extends TypedEventNames<this>>(type: K, ...args: TypedEventArgsList<this, K>): boolean;
    emit<K extends string | symbol>(type: K, ...args: TypedEventArgsList<this, K>): boolean;
}

export interface TypedEventEmitterConstructor extends Omit<typeof EventEmitter, never> {
    new (...args: ConstructorParameters<typeof EventEmitter>): TypedEventEmitter;
    prototype: TypedEventEmitter;
}

export const TypedEventEmitter = EventEmitter as TypedEventEmitterConstructor;

function identity(value: any) { return value; };

export function WithEvents<E extends TypedEventsBase<E>>(): <F extends abstract new (...args: any[]) => TypedEventEmitter>(base: F) => F & (abstract new (...args: any[]) => WithEvents<InstanceType<F>, E>);
export function WithEvents<F extends abstract new (...args: any[]) => TypedEventEmitter>(base: F): <E extends TypedEventsBase<E>>() => F & (abstract new (...args: any[]) => WithEvents<InstanceType<F>, E>);
export function WithEvents(base?: Function) {
    return base ? () => base : identity;
}