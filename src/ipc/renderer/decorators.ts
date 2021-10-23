/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { Event, EventSource } from "@esfx/events";
import { RendererOnly } from "../../core/renderer/decorators";
import { IpcContractBase, IpcEventContractBase, IpcEventNames, IpcMessageFunction, IpcMessageNames, IpcMessageParameters, IpcMessageReturnTypeConverter, IpcMessageSyncFunction, IpcMessageSyncReturnTypeConverter } from "../common/ipc";
import { MatchingKey, NonConstructor } from "../../core/common/types";
import { IpcClient, IpcClientEventObserver, IpcClientSync } from "./client";

export interface IpcClientDecorators<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents>> {
    /**
     * Decorates a class that should serve as an IPC client on an electron Renderer thread
     */
    IpcClientClass<C extends abstract new (...args: any[]) => Disposable>(target: C): C;

    /**
     * Decorates an IPC client method stub that can be invoked asynchronously on an IPC server.
     */
    IpcClientAsyncMethod<K extends IpcMessageNames<TContract>, F extends IpcMessageFunction<TContract, K>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>): void;
    /**
     * Decorates an IPC client method stub that can be invoked asynchronously on an IPC server.
     */
    IpcClientAsyncMethod(): <K extends IpcMessageNames<TContract>, F extends IpcMessageFunction<TContract, K>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>) => void;
    /**
     * Decorates an IPC client method stub that can be invoked asynchronously on an IPC server.
     */
    IpcClientAsyncMethod<K extends IpcMessageNames<TContract>>(key: K): <F extends IpcMessageFunction<TContract, K>>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<F>) => void;
    /**
     * Decorates an IPC client method stub that can be invoked asynchronously on an IPC server.
     */
    IpcClientAsyncMethod<K extends IpcMessageNames<TContract>, A, B>(key: K, converter: (value: A) => B): <F extends (...args: IpcMessageParameters<TContract, K>) => IpcMessageReturnTypeConverter<TContract, K, A, B>>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<F>) => void;
    /**
     * Decorates an IPC client method stub that can be invoked asynchronously on an IPC server.
     */
    IpcClientAsyncMethod<A, B>(converter: (value: A) => B): <K extends IpcMessageNames<TContract>, F extends (...args: IpcMessageParameters<TContract, K>) => IpcMessageReturnTypeConverter<TContract, K, A, B>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>) => void;

    /**
     * Decorates an IPC client method stub that can be invoked synchronously on an IPC server.
     */
    IpcClientSyncMethod<K extends IpcMessageNames<TContract>, F extends IpcMessageSyncFunction<TContract, K>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>): void;
    /**
     * Decorates an IPC client method stub that can be invoked synchronously on an IPC server.
     */
    IpcClientSyncMethod(): <K extends IpcMessageNames<TContract>, F extends IpcMessageSyncFunction<TContract, K>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>) => void;
    /**
     * Decorates an IPC client method stub that can be invoked synchronously on an IPC server.
     */
    IpcClientSyncMethod<K extends IpcMessageNames<TContract>>(key: K): <F extends IpcMessageSyncFunction<TContract, K>>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<F>) => void;
    /**
     * Decorates an IPC client method stub that can be invoked synchronously on an IPC server.
     */
    IpcClientSyncMethod<K extends IpcMessageNames<TContract>, A, B>(key: K, converter: (value: A) => B): <F extends (...args: IpcMessageParameters<TContract, K>) => IpcMessageSyncReturnTypeConverter<TContract, K, A, B>>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<F>) => void;
    /**
     * Decorates an IPC client method stub that can be invoked synchronously on an IPC server.
     */
    IpcClientSyncMethod<A, B>(converter: (value: A) => B): <K extends IpcMessageNames<TContract>, F extends (...args: IpcMessageParameters<TContract, K>) => IpcMessageSyncReturnTypeConverter<TContract, K, A, B>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>) => void;

    /**
     * Decorates an IPC client event that will be raised asynchronously by an IPC server.
     */
    IpcClientEvent<O extends object, K extends Extract<IpcEventNames<TEvents>, keyof O>>(target: NonConstructor<O>, propertyKey: MatchingKey<O, K, EventSource<TEvents[K]>>): void;
    /**
     * Decorates an IPC client event that will be raised asynchronously by an IPC server.
     */
    IpcClientEvent<O extends object, K extends IpcEventNames<TEvents>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>): void;
    /**
     * Decorates an IPC client event that will be raised asynchronously by an IPC server.
     */
    IpcClientEvent(): <O extends object, K extends Extract<IpcEventNames<TEvents>, keyof O>>(target: NonConstructor<O>, propertyKey: MatchingKey<O, K, EventSource<TEvents[K]>>) => void;
    /**
     * Decorates an IPC client event that will be raised asynchronously by an IPC server.
     */
    IpcClientEvent(): <O extends object, K extends IpcEventNames<TEvents>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>) => void;
    /**
     * Decorates an IPC client event that will be raised asynchronously by an IPC server.
     */
    IpcClientEvent<K extends IpcEventNames<TEvents>>(key: K): <O extends object>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>) => void;
}

export namespace IpcClientDecorators {
    const weakMemberMap = new WeakMap<object, Map<string, Map<string, ["IpcClientMethod" | "IpcClientSyncMethod" | "IpcClientEvent", string | symbol]>>>();
    
    export function create<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents> = never>(channel: string): IpcClientDecorators<TContract, TEvents> {
        const weakDisposed = new WeakSet<object>();
        const weakIpcClientAsync = new WeakMap<object, IpcClient<any> | undefined>();
        const weakIpcClientSync = new WeakMap<object, IpcClientSync<any> | undefined>();

        return {
            IpcClientClass,
            IpcClientAsyncMethod,
            IpcClientSyncMethod,
            IpcClientEvent,
        };

        /**
         * Decorates a class that should serve as an IPC client on an electron Renderer thread
         */
        function IpcClientClass<C extends abstract new (...args: any[]) => Disposable>(target: C): C {
            @RendererOnly
            abstract class _ extends target {
                #disposables: Disposable | undefined;

                constructor(...args: any[]) {
                    super(...args);

                    const messageNames = new Set<string>();
                    let ipcClientAsync: IpcClient<any> | undefined;
                    let ipcClientSync: IpcClientSync<any> | undefined;
                    let ipcClientEventObserver: IpcClientEventObserver<any> | undefined;
                    let current = new.target.prototype;
                    try {
                        while (current && current !== Object.prototype) {
                            const memberMap = weakMemberMap.get(current)?.get(channel);
                            if (memberMap) {
                                for (const [messageName, [kind, propertyKey]] of memberMap) {
                                    if (messageNames.has(messageName)) continue;
                                    messageNames.add(messageName);
                                    if (kind === "IpcClientEvent") {
                                        let source = (this as any)[propertyKey] as EventSource<any> | undefined;
                                        if (source === undefined) {
                                            source = Event.create(this);
                                            Object.defineProperty(this, propertyKey, {
                                                value: source,
                                                enumerable: false,
                                                configurable: true,
                                                writable: true
                                            });
                                        }
                                        else if (!(source instanceof EventSource)) {
                                            throw new TypeError(`Expected ${propertyKey.toString()} to be an EventSource or 'undefined'.`);
                                        }
                                        ipcClientEventObserver ||= new IpcClientEventObserver(channel);
                                        ipcClientEventObserver.on(messageName, (...args) => source?.emit(...args));
                                    }
                                    else if (kind === "IpcClientMethod") {
                                        ipcClientAsync ||= new IpcClient<any>(channel);
                                    }
                                    else if (kind === "IpcClientSyncMethod") {
                                        ipcClientSync ||= new IpcClientSync<any>(channel);
                                    }
                                }
                            }
                            current = Object.getPrototypeOf(current);
                        }
                    }
                    catch (e) {
                        const disposables = Disposable.from([
                            ipcClientAsync,
                            ipcClientSync,
                            ipcClientEventObserver,
                            Disposable.create(() => super[Disposable.dispose]())
                        ]);
                        Disposable.use(disposables, () => {
                            weakDisposed.add(this);
                            this.#disposables = undefined;
                            throw e;
                        });
                    }

                    weakIpcClientAsync.set(this, ipcClientAsync);
                    weakIpcClientSync.set(this, ipcClientSync);
                    this.#disposables = Disposable.from([
                        ipcClientAsync,
                        ipcClientSync,
                        ipcClientEventObserver,
                        Disposable.create(() => {
                            weakDisposed.add(this);
                            weakIpcClientAsync.delete(this);
                            weakIpcClientSync.delete(this);
                            super[Disposable.dispose]();
                        })
                    ]);
                }

                [Disposable.dispose]() {
                    const disposables = this.#disposables;
                    if (disposables) {
                        this.#disposables = undefined;
                        disposables[Disposable.dispose]();
                    }
                    else {
                        super[Disposable.dispose]();
                    }
                }
            }

            const name = /^ipcclient/i.test(target.name) ? target.name : `IpcClient${target.name.replace(/^(ipc|client)+/i, "")}`;
            Object.defineProperty(_, "name", { ...Object.getOwnPropertyDescriptor(_, "name"), value: name });
            return _;
        }

        /**
         * Decorates an IPC client method stub that can be invoked asynchronously on an IPC server.
         */
        function IpcClientAsyncMethod(...args: [] | [string] | [(value: any) => any] | [string, (value: any) => any] | [object, string | symbol, TypedPropertyDescriptor<Function>?]): any {
            let key: string | undefined;
            let converter: ((value: any) => any) | undefined;
            if (isEmptyOverload(args)) return decorator;
            if (isKeyOverload(args)) return [key] = args, decorator;
            if (isConverterOverload(args)) return [converter] = args, decorator;
            if (isKeyConverterOverload(args)) return [key, converter] = args, decorator;
            if (isDecoratorOverload(args)) return decorator(...args);
            throw new TypeError("Invalid decorator usage");
            function decorator(target: object, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) {
                if (typeof target === "function" || descriptor !== undefined && (typeof descriptor.value !== "function" || descriptor.get || descriptor.set)) throw new TypeError("@IpcClientMethod-decorator is only allowed on instance methods");
                const messageName = addMember("IpcClientMethod", channel, target, propertyKey, key);
                const isField = !descriptor;
                descriptor = {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    ...descriptor,
                    value: async function (this: object, ...args: any[]) {
                        if (weakDisposed.has(this)) throw new ReferenceError("Object is disposed");
                        const ipcClientAsync = weakIpcClientAsync.get(this);
                        if (!ipcClientAsync) throw new TypeError("Method called on wrong target.");
                        const result = await ipcClientAsync.send(messageName, ...args);
                        return converter && result !== undefined && result !== null ? converter(result) : result;
                    }
                };
                if (isField) Object.defineProperty(target, propertyKey, descriptor);
                return descriptor;
            }
        }

        /**
         * Decorates an IPC client method stub that can be invoked synchronously on an IPC server.
         */
        function IpcClientSyncMethod(...args: [] | [string] | [(value: any) => any] | [string, (value: any) => any] | [object, string | symbol, TypedPropertyDescriptor<Function>?]): any {
            let key: string | undefined;
            let converter: ((value: any) => any) | undefined;
            if (isEmptyOverload(args)) return decorator;
            if (isKeyOverload(args)) return [key] = args, decorator;
            if (isConverterOverload(args)) return [converter] = args, decorator;
            if (isKeyConverterOverload(args)) return [key, converter] = args, decorator;
            if (isDecoratorOverload(args)) return decorator(...args);
            throw new TypeError("Invalid decorator usage");
            function decorator(target: object, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) {
                if (typeof target === "function" || descriptor !== undefined && (typeof descriptor.value !== "function" || descriptor.get || descriptor.set)) throw new TypeError("@IpcClientSyncMethod-decorator is only allowed on instance methods");
                const messageName = addMember("IpcClientSyncMethod", channel, target, propertyKey, key);
                const isField = !descriptor;
                descriptor = {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    ...descriptor,
                    value: function (this: object, ...args: any[]) {
                        if (weakDisposed.has(this)) throw new ReferenceError("Object is disposed");
                        const ipcClientSync = weakIpcClientSync.get(this);
                        if (!ipcClientSync) throw new TypeError("Method called on wrong target.");
                        const result = ipcClientSync.sendSync(messageName, ...args);
                        return converter && result !== undefined && result !== null ? converter(result) : result;
                    }
                };
                if (isField) Object.defineProperty(target, propertyKey, descriptor);
                return descriptor;
            }
        }

        /**
         * Decorates an IPC client event that will be raised asynchronously by an IPC server.
         */
        function IpcClientEvent(...args: [] | [string] | [object, string | symbol, PropertyDescriptor?]): any {
            let key: string | undefined;
            if (isEmptyOverload(args)) return decorator;
            if (isKeyOverload(args)) return [key] = args, decorator;
            if (isDecoratorOverload(args)) return decorator(...args);
            throw new TypeError("Invalid decorator usage");
            function decorator(target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) {
                if (typeof target === "function" || descriptor !== undefined && (typeof descriptor.value === "function" || descriptor.get || descriptor.set)) throw new TypeError("@IpcServerEvent-decorator is only allowed on instance fields");
                addMember("IpcClientEvent", channel, target, propertyKey, key);
            }
        }
    }

    function addMember(kind: "IpcClientMethod" | "IpcClientSyncMethod" | "IpcClientEvent", channel: string, target: object, propertyKey: string | symbol, key: string | undefined) {
        const messageName = getMessageName(kind, key, propertyKey);
        let channelMap = weakMemberMap.get(target);
        if (!channelMap) weakMemberMap.set(target, channelMap = new Map());
        let map = channelMap.get(channel);
        if (!map) channelMap.set(channel, map = new Map());
        const existing = map.get(messageName);
        if (existing) throw new TypeError(`@${kind}-decorator an ${existing[0]} message handler for '${messageName}' was already registered.`);
        map.set(messageName, [kind, propertyKey]);
        return messageName;
    }

    function getMessageName(kind: "IpcClientMethod" | "IpcClientSyncMethod" | "IpcClientEvent", key: string | undefined, propertyKey: string | symbol) {
        if (key !== undefined) return key;
        if (typeof propertyKey === "string") return propertyKey;
        throw new TypeError(`@${kind}-decorator cannot have a symbol for a message name.`);
    }

    function isEmptyOverload(args: [] | [string] | [(value: any) => any] | [string, (value: any) => any] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [] {
        return args.length === 0;
    }

    function isKeyOverload(args: [] | [string] | [(value: any) => any] | [string, (value: any) => any] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [string] {
        return args.length === 1 && typeof args[0] === "string";
    }

    function isConverterOverload(args: [] | [string] | [(value: any) => any] | [string, (value: any) => any] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [(value: any) => any] {
        return args.length === 1 && typeof args[0] === "function";
    }

    function isKeyConverterOverload(args: [] | [string] | [(value: any) => any] | [string, (value: any) => any] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [string, (value: any) => any] {
        return args.length === 2 && typeof args[0] === "string" && typeof args[1] === "function";
    }

    function isDecoratorOverload(args: [] | [string] | [(value: any) => any] | [string, (value: any) => any] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [object, string | symbol, TypedPropertyDescriptor<any>?] {
        return (args.length === 2 || args.length === 3)
            && (typeof args[0] === "object" || typeof args[0] === "function")
            && (typeof args[1] === "string" || typeof args[1] === "symbol");
    }
}
