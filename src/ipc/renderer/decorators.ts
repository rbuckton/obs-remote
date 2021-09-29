import { Disposable } from "@esfx/disposable";
import { Event, EventSource } from "@esfx/events";
import { MatchingKey, NonConstructor } from "service-composition/dist/types";
import { RendererOnly } from "../../core/renderer/decorators";
import { IpcContractBase, IpcMessageNames, IpcMessageFunction, IpcMessageSyncFunction, IpcMessageSyncReturnTypeConverter, IpcMessageReturnTypeConverter, IpcMessageParameters, IpcEventContractBase, IpcEventNames } from "../common/ipc";
import { IpcClient, IpcClientEventObserver, IpcClientSync } from "./client";

export interface IpcClientDecorators<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents>> {
    IpcClientClass<C extends abstract new (...args: any[]) => Disposable>(target: C): C;
    IpcClientMethod<K extends IpcMessageNames<TContract>, F extends IpcMessageFunction<TContract, K>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>): void;
    IpcClientMethod(): <K extends IpcMessageNames<TContract>, F extends IpcMessageFunction<TContract, K>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>) => void;
    IpcClientMethod<K extends IpcMessageNames<TContract>>(key: K): <F extends IpcMessageFunction<TContract, K>>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<F>) => void;
    IpcClientMethod<K extends IpcMessageNames<TContract>, A, B>(key: K, converter: (value: A) => B): <F extends (...args: IpcMessageParameters<TContract, K>) => IpcMessageReturnTypeConverter<TContract, K, A, B>>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<F>) => void;
    IpcClientMethod<A, B>(converter: (value: A) => B): <K extends IpcMessageNames<TContract>, F extends (...args: IpcMessageParameters<TContract, K>) => IpcMessageReturnTypeConverter<TContract, K, A, B>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>) => void;
    IpcClientSyncMethod<K extends IpcMessageNames<TContract>, F extends IpcMessageSyncFunction<TContract, K>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>): void;
    IpcClientSyncMethod(): <K extends IpcMessageNames<TContract>, F extends IpcMessageSyncFunction<TContract, K>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>) => void;
    IpcClientSyncMethod<K extends IpcMessageNames<TContract>>(key: K): <F extends IpcMessageSyncFunction<TContract, K>>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<F>) => void;
    IpcClientSyncMethod<K extends IpcMessageNames<TContract>, A, B>(key: K, converter: (value: A) => B): <F extends (...args: IpcMessageParameters<TContract, K>) => IpcMessageSyncReturnTypeConverter<TContract, K, A, B>>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<F>) => void;
    IpcClientSyncMethod<A, B>(converter: (value: A) => B): <K extends IpcMessageNames<TContract>, F extends (...args: IpcMessageParameters<TContract, K>) => IpcMessageSyncReturnTypeConverter<TContract, K, A, B>>(target: object, propertyKey: K, descriptor: TypedPropertyDescriptor<F>) => void;
    IpcClientEvent<O extends object, K extends Extract<IpcEventNames<TEvents>, keyof O>>(target: NonConstructor<O>, propertyKey: MatchingKey<O, K, EventSource<TEvents[K]>>): void;
    IpcClientEvent<O extends object, K extends IpcEventNames<TEvents>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>): void;
    IpcClientEvent(): <O extends object, K extends Extract<IpcEventNames<TEvents>, keyof O>>(target: NonConstructor<O>, propertyKey: MatchingKey<O, K, EventSource<TEvents[K]>>) => void;
    IpcClientEvent(): <O extends object, K extends IpcEventNames<TEvents>>(target: NonConstructor<O>, propertyKey: K, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>) => void;
    IpcClientEvent<K extends IpcEventNames<TEvents>>(key: K): <O extends object>(target: NonConstructor<O>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<EventSource<TEvents[K]>>) => void;
}

export namespace IpcClientDecorators {
    const weakMemberMap = new WeakMap<object, Map<string, Map<string, ["IpcClientMethod" | "IpcClientSyncMethod" | "IpcClientEvent", string | symbol]>>>();
    
    export function create<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents> = never>(channel: string): IpcClientDecorators<TContract, TEvents> {
        const weakIpcAsyncClient = new WeakMap<object, IpcClient<any>>();
        const weakIpcSyncClient = new WeakMap<object, IpcClientSync<any>>();
        return { IpcClientClass, IpcClientMethod, IpcClientSyncMethod, IpcClientEvent };

        function IpcClientClass<C extends abstract new (...args: any[]) => Disposable>(target: C): C {
            @RendererOnly
            abstract class _ extends target {
                #ipcEventObserver: IpcClientEventObserver<any> | undefined;
                constructor(...args: any[]) {
                    super(...args);
                    const messageNames = new Set<string>();
                    let current = new.target.prototype;
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
                                    this.#ipcEventObserver ||= new IpcClientEventObserver(channel);
                                    this.#ipcEventObserver.on(messageName, (...args) => source?.emit(...args));
                                }
                                else if (kind === "IpcClientMethod") {
                                    if (!weakIpcAsyncClient.has(target)) weakIpcAsyncClient.set(this, new IpcClient<any>(channel));
                                }
                                else if (kind === "IpcClientSyncMethod") {
                                    if (!weakIpcSyncClient.has(target)) weakIpcSyncClient.set(this, new IpcClientSync<any>(channel));
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
                        this.#ipcEventObserver?.dispose();
                        this.#ipcEventObserver = undefined;
                        weakIpcAsyncClient.delete(this);
                        weakIpcSyncClient.delete(this);
                    }
                }
            }
            const name = /^ipcclient/i.test(target.name) ? target.name : `IpcClient${target.name.replace(/^(ipc|client)+/i, "")}`;
            Object.defineProperty(_, "name", { ...Object.getOwnPropertyDescriptor(_, "name"), value: name });
            return _;
        }

        function IpcClientMethod(...args: [] | [string] | [(value: any) => any] | [string, (value: any) => any] | [object, string | symbol, TypedPropertyDescriptor<Function>?]): any {
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
                        const ipcClient = weakIpcAsyncClient.get(this);
                        if (!ipcClient) throw new TypeError("Method called on wrong target.");
                        const result = await ipcClient.send(messageName, ...args);
                        return converter && result !== undefined && result !== null ? converter(result) : result;
                    }
                };
                if (isField) Object.defineProperty(target, propertyKey, descriptor);
                return descriptor;
            }
        }

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
                        const ipcClient = weakIpcSyncClient.get(this);
                        if (!ipcClient) throw new TypeError("Method called on wrong target.");
                        const result = ipcClient.sendSync(messageName, ...args);
                        return converter && result !== undefined && result !== null ? converter(result) : result;
                    }
                };
                if (isField) Object.defineProperty(target, propertyKey, descriptor);
                return descriptor;
            }
        }

        function IpcClientEvent(...args: [] | [string] | [object, string | symbol]): any {
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
