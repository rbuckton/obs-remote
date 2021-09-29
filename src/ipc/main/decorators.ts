import { Disposable } from "@esfx/disposable";
import { Event, EventSource } from "@esfx/events";
import { MatchingKey, NonConstructor } from "service-composition/dist/types";
import { MainOnly } from "../../core/main/decorators";
import { IpcContractBase, IpcMessageNames, IpcMessageFunction, IpcMessageSyncFunction, IpcMessageReturnType, IpcMessageParameterConverters, IpcMessageSyncReturnType, ConvertersArray, IpcEventContractBase, IpcEventNames } from "../common/ipc";
import { IpcServer, IpcServerEventEmitter, IpcServerSync } from "./server";

export interface IpcServerDecorators<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents>> {
    IpcServerClass<C extends abstract new (...args: any[]) => Disposable>(target: C): C;
    IpcServerMethod<O extends object, K extends IpcMessageNames<TContract>, T extends IpcMessageFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor: TypedPropertyDescriptor<T>): void;
    IpcServerMethod(): <O extends object, K extends IpcMessageNames<TContract>, T extends IpcMessageFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor: TypedPropertyDescriptor<T>) => void;
    IpcServerMethod<K extends IpcMessageNames<TContract>>(key: K): <O extends object, T extends IpcMessageFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => void;
    IpcServerMethod<K extends IpcMessageNames<TContract>, A extends ConvertersArray>(key: K, converters: A): <O extends object, T extends (...args: IpcMessageParameterConverters<TContract, K, A>) => Promise<IpcMessageReturnType<TContract, K>>>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<T>) => void;
    IpcServerMethod<A extends ConvertersArray | []>(converters: A): <O extends object, K extends IpcMessageNames<TContract>, T extends (...args: IpcMessageParameterConverters<TContract, K, A>) => Promise<IpcMessageReturnType<TContract, K>>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<T>) => void;
    IpcServerSyncMethod<O extends object, K extends IpcMessageNames<TContract>, T extends IpcMessageSyncFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor: TypedPropertyDescriptor<T>): void;
    IpcServerSyncMethod(): <O extends object, K extends IpcMessageNames<TContract>, T extends IpcMessageSyncFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor: TypedPropertyDescriptor<T>) => void;
    IpcServerSyncMethod<K extends IpcMessageNames<TContract>>(key: K): <O extends object, T extends IpcMessageSyncFunction<TContract, K>>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => void;
    IpcServerSyncMethod<K extends IpcMessageNames<TContract>, A extends ConvertersArray>(key: K, converters: A | []): <O extends object, T extends (...args: IpcMessageParameterConverters<TContract, K, A>) => IpcMessageSyncReturnType<TContract, K>>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<T>) => void;
    IpcServerSyncMethod<A extends ConvertersArray | []>(converters: A): <O extends object, K extends IpcMessageNames<TContract>, T extends (...args: IpcMessageParameterConverters<TContract, K, A>) => IpcMessageSyncReturnType<TContract, K>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<T>) => void;
    IpcServerEvent<O extends object, K extends Extract<IpcEventNames<TEvents>, keyof O>>(target: NonConstructor<O>, propertyKey: MatchingKey<O, K, EventSource<TEvents[K]>>): void;
    IpcServerEvent<O extends object, K extends IpcEventNames<TEvents>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>): void;
    IpcServerEvent(): <O extends object, K extends IpcEventNames<TEvents>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>) => void;
    IpcServerEvent<K extends IpcEventNames<TEvents>>(key: K): <O extends object>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>) => void;
}

export namespace IpcServerDecorators {
    const weakMemberMap = new WeakMap<object, Map<string, Map<string, ["IpcServerMethod" | "IpcServerSyncMethod" | "IpcServerEvent", string | symbol, ConvertersArray?]>>>();
    
    /**
     * Creates an entangled set of decorators used to define an IPC server for a specific channel name.
     */
    export function create<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents>>(channel: string): IpcServerDecorators<TContract, TEvents> {
        return { IpcServerClass, IpcServerMethod, IpcServerSyncMethod, IpcServerEvent };

        function IpcServerClass<T extends abstract new (...args: any[]) => Disposable>(target: T): T {
            @MainOnly
            abstract class _ extends target {
                #ipcServerAsync: IpcServer<any> | undefined;
                #ipcServerSync: IpcServerSync<any> | undefined;
                #ipcEventEmitter: IpcServerEventEmitter<any> | undefined;

                constructor(...args: any[]) {
                    super(...args);
                    const asyncMessageMap = Object.create(null);
                    const syncMessageMap = Object.create(null);
                    const messageNames = new Set<string>();
                    let current = new.target.prototype;
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
                                        this.#ipcEventEmitter?.emit(messageName, ...args);
                                    });
                                    this.#ipcEventEmitter ||= new IpcServerEventEmitter<any>(channel);
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
                                        this.#ipcServerSync ||= new IpcServerSync<any>(channel, syncMessageMap);
                                    }
                                    else {
                                        asyncMessageMap[messageName] = async (...args: any[]) => wrapper(...args);
                                        this.#ipcServerAsync ||= new IpcServer<any>(channel, asyncMessageMap);
                                    }
                                }
                            }
                        }
                        current = Object.getPrototypeOf(current);
                    }
                }

                [Disposable.dispose]() {
                    try {
                        super[Disposable.dispose]();
                    }
                    finally {
                        try {
                            const disposable = this.#ipcServerAsync;
                            this.#ipcServerAsync = undefined;
                            disposable?.dispose();
                        }
                        finally {
                            try {
                                const disposable = this.#ipcServerSync;
                                this.#ipcServerSync = undefined;
                                disposable?.dispose();
                            }
                            finally {
                                const disposable = this.#ipcEventEmitter;
                                this.#ipcEventEmitter = undefined;
                                disposable?.dispose();
                            }
                        }
                    }
                }
            }
            const name = /^ipcserver/i.test(target.name) ? target.name : `IpcServer${target.name.replace(/^(ipc|server)+/i, "")}`;
            Object.defineProperty(_, "name", { ...Object.getOwnPropertyDescriptor(_, "name"), value: name });
            return _;
        }

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
