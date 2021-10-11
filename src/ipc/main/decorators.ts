/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { Event, EventSource } from "@esfx/events";
import { MatchingKey, NonConstructor } from "service-composition/dist/types";
import { MainOnly } from "../../core/main/decorators";
import { IpcContractBase, IpcMessageNames, IpcMessageFunction, IpcMessageSyncFunction, IpcMessageReturnType, IpcMessageParameterConverters, IpcMessageSyncReturnType, ConvertersArray, IpcEventContractBase, IpcEventNames } from "../common/ipc";
import { IpcServer, IpcServerEventEmitter, IpcServerSync } from "./server";

export interface IpcServerDecorators<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents>> {
    /**
     * Decorates a class that should serve as an IPC server on the electron Main thread.
     */
    IpcServerClass<C extends abstract new (...args: any[]) => Disposable>(target: C): C;

    /**
     * Decorates an IPC server method that can be invoked asynchronously by an IPC client.
     */
    IpcServerMethod<O extends object, K extends IpcMessageNames<TContract>, T extends IpcMessageFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor: TypedPropertyDescriptor<T>): void;
    /**
     * Decorates an IPC server method that can be invoked asynchronously by an IPC client.
     */
    IpcServerMethod(): <O extends object, K extends IpcMessageNames<TContract>, T extends IpcMessageFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor: TypedPropertyDescriptor<T>) => void;
    /**
     * Decorates an IPC server method that can be invoked asynchronously by an IPC client.
     */
    IpcServerMethod<K extends IpcMessageNames<TContract>>(key: K): <O extends object, T extends IpcMessageFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => void;
    /**
     * Decorates an IPC server method that can be invoked asynchronously by an IPC client.
     */
    IpcServerMethod<K extends IpcMessageNames<TContract>, A extends ConvertersArray>(key: K, converters: A): <O extends object, T extends (...args: IpcMessageParameterConverters<TContract, K, A>) => Promise<IpcMessageReturnType<TContract, K>>>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<T>) => void;
    /**
     * Decorates an IPC server method that can be invoked asynchronously by an IPC client.
     */
    IpcServerMethod<A extends ConvertersArray | []>(converters: A): <O extends object, K extends IpcMessageNames<TContract>, T extends (...args: IpcMessageParameterConverters<TContract, K, A>) => Promise<IpcMessageReturnType<TContract, K>>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<T>) => void;

    /**
     * Decorates an IPC server method that can be invoked synchronously by an IPC client.
     */
    IpcServerSyncMethod<O extends object, K extends IpcMessageNames<TContract>, T extends IpcMessageSyncFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor: TypedPropertyDescriptor<T>): void;
    /**
     * Decorates an IPC server method that can be invoked synchronously by an IPC client.
     */
    IpcServerSyncMethod(): <O extends object, K extends IpcMessageNames<TContract>, T extends IpcMessageSyncFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor: TypedPropertyDescriptor<T>) => void;
    /**
     * Decorates an IPC server method that can be invoked synchronously by an IPC client.
     */
    IpcServerSyncMethod<K extends IpcMessageNames<TContract>>(key: K): <O extends object, T extends IpcMessageSyncFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => void;
    /**
     * Decorates an IPC server method that can be invoked synchronously by an IPC client.
     */
    IpcServerSyncMethod<K extends IpcMessageNames<TContract>, A extends ConvertersArray>(key: K, converters: A | []): <O extends object, T extends (...args: IpcMessageParameterConverters<TContract, K, A>) => IpcMessageSyncReturnType<TContract, K>>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<T>) => void;
    /**
     * Decorates an IPC server method that can be invoked synchronously by an IPC client.
     */
    IpcServerSyncMethod<A extends ConvertersArray | []>(converters: A): <O extends object, K extends IpcMessageNames<TContract>, T extends (...args: IpcMessageParameterConverters<TContract, K, A>) => IpcMessageSyncReturnType<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<T>) => void;

    /**
     * Decorates an IPC server event that will be raised asynchronously on an IPC client.
     */
    IpcServerEvent<O extends object, K extends Extract<IpcEventNames<TEvents>, keyof O>>(target: NonConstructor<O>, propertyKey: MatchingKey<O, K, EventSource<TEvents[K]>>): void;
    /**
     * Decorates an IPC server event that will be raised asynchronously on an IPC client.
     */
    IpcServerEvent<O extends object, K extends IpcEventNames<TEvents>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>): void;
    /**
     * Decorates an IPC server event that will be raised asynchronously on an IPC client.
     */
    IpcServerEvent(): <O extends object, K extends IpcEventNames<TEvents>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>) => void;
    /**
     * Decorates an IPC server event that will be raised asynchronously on an IPC client.
     */
    IpcServerEvent<K extends IpcEventNames<TEvents>>(key: K): <O extends object>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>) => void;
}

export namespace IpcServerDecorators {
    const weakMemberMap = new WeakMap<object, Map<string, Map<string, ["IpcServerMethod" | "IpcServerSyncMethod" | "IpcServerEvent", string | symbol, ConvertersArray?]>>>();

    /**
     * Creates an entangled set of decorators used to define an IPC server for a specific channel name.
     */
    export function create<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents>>(channel: string): IpcServerDecorators<TContract, TEvents> {
        return { IpcServerClass, IpcServerMethod, IpcServerSyncMethod, IpcServerEvent };

        /**
         * Decorates a class that should serve as an IPC Server
         */
        function IpcServerClass<T extends abstract new (...args: any[]) => Disposable>(target: T): T {
            @MainOnly
            abstract class _ extends target {
                #disposables: Disposable | undefined;

                constructor(...args: any[]) {
                    super(...args);
                    const asyncMessageMap = Object.create(null);
                    const syncMessageMap = Object.create(null);
                    const messageNames = new Set<string>();
                    let ipcServerAsync: IpcServer<any> | undefined;
                    let ipcServerSync: IpcServerSync<any> | undefined;
                    let ipcServerEventEmitter: IpcServerEventEmitter<any> | undefined;
                    let current = new.target.prototype;
                    try {
                        while (current && current !== Object.prototype) {
                            const methodMap = weakMemberMap.get(current)?.get(channel);
                            if (methodMap) {
                                for (const [messageName, [kind, propertyKey, converters]] of methodMap) {
                                    if (messageNames.has(messageName)) continue;
                                    messageNames.add(messageName);
                                    if (kind === "IpcServerEvent") {
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
                                        source.event.on((...args) => {
                                            ipcServerEventEmitter?.emit(messageName, ...args);
                                        });
                                        ipcServerEventEmitter ||= new IpcServerEventEmitter<any>(channel);
                                    }
                                    else {
                                        const sync = kind === "IpcServerSyncMethod";
                                        const wrapper = (...args: any[]) => {
                                            if (converters) {
                                                for (let i = 0; i < args.length && i < converters.length; i++) {
                                                    const converter = converters[i];
                                                    if (typeof converter === "function" && args[i] !== null && args[i] !== undefined) {
                                                        args[i] = converter(args[i]);
                                                    }
                                                }
                                            }
                                            return (this as any)[propertyKey](...args);
                                        };
                                        if (sync) {
                                            syncMessageMap[messageName] = wrapper;
                                            ipcServerSync ||= new IpcServerSync<any>(channel, syncMessageMap);
                                        }
                                        else {
                                            asyncMessageMap[messageName] = async (...args: any[]) => wrapper(...args);
                                            ipcServerAsync ||= new IpcServer<any>(channel, asyncMessageMap);
                                        }
                                    }
                                }
                            }
                            current = Object.getPrototypeOf(current);
                        }
                    }
                    catch (e) {
                        const disposables = Disposable.from([
                            ipcServerAsync,
                            ipcServerSync,
                            ipcServerEventEmitter
                        ]);
                        Disposable.use(disposables, () => {
                            throw e;
                        });
                    }

                    this.#disposables = Disposable.from([
                        ipcServerAsync,
                        ipcServerSync,
                        ipcServerEventEmitter,
                        Disposable.create(() => super[Disposable.dispose]()),
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

            const name = /^ipcserver/i.test(target.name) ? target.name : `IpcServer${target.name.replace(/^(ipc|server)+/i, "")}`;
            Object.defineProperty(_, "name", { ...Object.getOwnPropertyDescriptor(_, "name"), value: name });
            return _;
        }

        /**
         * Decorates an IPC server method that can be invoked asynchronously by an IPC client.
         */
        function IpcServerMethod(...args: [] | [string] | [string, ConvertersArray] | [ConvertersArray] | [object, string | symbol, TypedPropertyDescriptor<Function>?]): any {
            let key: string | undefined;
            let converters: ConvertersArray | undefined;
            if (isEmptyOverload(args)) return decorator;
            if (isKeyOverload(args)) return [key] = args, decorator;
            if (isConvertersOverload(args)) return [converters] = args, decorator;
            if (isKeyConvertersOverload(args)) return [key, converters] = args, decorator;
            if (isDecoratorOverload(args)) return decorator(...args);
            throw new TypeError("Invalid decorator usage");
            function decorator(target: object, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) {
                if (typeof target === "function" || descriptor !== undefined && (typeof descriptor.value !== "function" || descriptor.get || descriptor.set)) throw new TypeError("@IpcServerMethod-decorator is only allowed on instance methods");
                addMember("IpcServerMethod", channel, target, propertyKey, key, converters);
            }
        }

        /**
         * Decorates an IPC server method that can be invoked synchronously by an IPC client.
         */
        function IpcServerSyncMethod(...args: [] | [string] | [string, ConvertersArray] | [ConvertersArray] | [object, string | symbol, TypedPropertyDescriptor<Function>]): any {
            let key: string | undefined;
            let converters: ConvertersArray | undefined;
            if (isEmptyOverload(args)) return decorator;
            if (isKeyOverload(args)) return [key] = args, decorator;
            if (isConvertersOverload(args)) return [converters] = args, decorator;
            if (isKeyConvertersOverload(args)) return [key, converters] = args, decorator;
            if (isDecoratorOverload(args)) return decorator(...args);
            throw new TypeError("Invalid decorator usage");
            function decorator(target: object, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) {
                if (typeof target === "function" || descriptor !== undefined && (typeof descriptor.value !== "function" || descriptor.get || descriptor.set)) throw new TypeError("@IpcServerSyncMethod-decorator is only allowed on instance methods");
                addMember("IpcServerSyncMethod", channel, target, propertyKey, key, converters);
            }
        }

        /**
         * Decorates an IPC server event that will be raised asynchronously on an IPC client.
         */
        function IpcServerEvent(...args: [] | [string] | [object, string | symbol, TypedPropertyDescriptor<EventSource<any>>?]): any {
            let key: string | undefined;
            if (isEmptyOverload(args)) return decorator;
            if (isKeyOverload(args)) return [key] = args, decorator;
            if (isDecoratorOverload(args)) return decorator(...args);
            throw new TypeError("Invalid decorator usage");
            function decorator(target: object, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<EventSource<any>>) {
                if (typeof target === "function" || descriptor !== undefined && (typeof descriptor.value === "function" || descriptor.get || descriptor.set)) throw new TypeError("@IpcServerEvent-decorator is only allowed on instance fields");
                addMember("IpcServerEvent", channel, target, propertyKey, key);
            }
        }
    }

    function addMember(kind: "IpcServerMethod" | "IpcServerSyncMethod" | "IpcServerEvent", channel: string, target: object, propertyKey: string | symbol, key: string | undefined, converters?: ConvertersArray) {
        const messageName = getMessageName(kind, key, propertyKey);
        let channelMap = weakMemberMap.get(target);
        if (!channelMap) weakMemberMap.set(target, channelMap = new Map());
        let map = channelMap.get(channel);
        if (!map) channelMap.set(channel, map = new Map());
        const existing = map.get(messageName);
        if (existing) throw new TypeError(`@${kind}-decorator an ${existing[0]} message handler for '${messageName}' was already registered.`);
        map.set(messageName, [kind, propertyKey, converters]);
    }

    function getMessageName(kind: "IpcServerMethod" | "IpcServerSyncMethod" | "IpcServerEvent", key: string | undefined, propertyKey: string | symbol) {
        if (key !== undefined) return key;
        if (typeof propertyKey === "string") return propertyKey;
        throw new TypeError(`@${kind}-decorator cannot have a symbol for a message name.`);
    }

    function isEmptyOverload(args: [] | [string] | [string, ConvertersArray] | [ConvertersArray] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [] {
        return args.length === 0;
    }

    function isKeyOverload(args: [] | [string] | [string, ConvertersArray] | [ConvertersArray] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [string] {
        return args.length === 1 && typeof args[0] === "string";
    }

    function isConvertersOverload(args: [] | [string] | [string, ConvertersArray] | [ConvertersArray] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [ConvertersArray] {
        return args.length === 1 && Array.isArray(args[0]);
    }

    function isKeyConvertersOverload(args: [] | [string] | [string, ConvertersArray] | [ConvertersArray] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [string, ConvertersArray] {
        return args.length === 2 && typeof args[0] === "string" && Array.isArray(args[1]);
    }

    function isDecoratorOverload(args: [] | [string] | [string, ConvertersArray] | [ConvertersArray] | [object, string | symbol, TypedPropertyDescriptor<any>?]): args is [object, string | symbol, TypedPropertyDescriptor<any>?] {
        return (args.length === 2 || args.length === 3)
            && (typeof args[0] === "object" || typeof args[0] === "function")
            && (typeof args[1] === "string" || typeof args[1] === "symbol");
    }
}
