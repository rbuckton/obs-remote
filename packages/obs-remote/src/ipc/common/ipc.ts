/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

/**
 * The base constraint for an IPC contract.
 */
export type IpcContractBase<T> = Record<keyof T, (...args: any[]) => any>;

/**
 * Extracts the message names of an IPC contract.
 */
export type IpcMessageNames<T extends IpcContractBase<T>> = Extract<keyof T, string>;

/**
 * Extracts the parameters of an IPC contract message.
 */
export type IpcMessageParameters<T extends IpcContractBase<T>, K extends IpcMessageNames<T>> = Parameters<T[K]>;

/**
 * Defines converters used to marshal arguments from an IPC wire format.
 */
export type IpcMessageParameterConverters<T extends IpcContractBase<T>, K extends IpcMessageNames<T>, A extends ConvertersArray> = ParameterConverters<IpcMessageParameters<T, K>, A>;

/**
 * Extracts the async return type of an IPC contract message.
 */
export type IpcMessageReturnType<T extends IpcContractBase<T>, K extends IpcMessageNames<T>> = PromisedType<ReturnType<T[K]>>;

/**
 * Defines a converter used to marshal an async return type from an IPC wire format.
 */
export type IpcMessageReturnTypeConverter<T extends IpcContractBase<T>, K extends IpcMessageNames<T>, A, B> =
    [A | undefined] extends [ReturnType<T[K]>] ? Promise<PromisedType<B> | undefined> :
    [A] extends [ReturnType<T[K]>] ? Promise<PromisedType<B> | undefined> :
    Promise<PromisedType<A> | undefined>;

/**
 * Defines an IPC contract message's async function signature.
 */
export type IpcMessageFunction<T extends IpcContractBase<T>, K extends IpcMessageNames<T>> = (...args: IpcMessageParameters<T, K>) => Promise<IpcMessageReturnType<T, K>>;

/**
 * Extracts the sync return type of an IPC contract message.
 */
export type IpcMessageSyncReturnType<T extends IpcContractBase<T>, K extends IpcMessageNames<T>> = ReturnType<T[K]>;

/**
 * Defines a converter used to marshal a sync return type from an IPC wire format.
 */
export type IpcMessageSyncReturnTypeConverter<T extends IpcContractBase<T>, K extends IpcMessageNames<T>, A, B> = 
    [A | undefined] extends [ReturnType<T[K]>] ? B | undefined :
    [A] extends [ReturnType<T[K]>] ? B | undefined :
    A | undefined;

/**
 * Defines an IPC contract message's sync function signature.
 */
export type IpcMessageSyncFunction<T extends IpcContractBase<T>, K extends IpcMessageNames<T>> = (...args: IpcMessageParameters<T, K>) => IpcMessageSyncReturnType<T, K>;

/**
 * The base constraint for an IPC event contract.
 */
export type IpcEventContractBase<T> = Record<keyof T, (...args: any[]) => void>;

/**
 * Extracts the event names of an IPC contract.
 */
export type IpcEventNames<T extends IpcEventContractBase<T>> = Extract<keyof T, string>;

/**
 * Extracts the parameters of an event in an IPC event contract.
 */
export type IpcEventParameters<T extends IpcEventContractBase<T>, K extends IpcEventNames<T>> = Parameters<T[K]>;

/**
 * Defines converters used to marshal arguments from an IPC wire format.
 */
export type IpcEventParameterConverters<T extends IpcEventContractBase<T>, K extends IpcEventNames<T>, A extends ConvertersArray> = ParameterConverters<IpcEventParameters<T, K>, A>;

/**
 * Defines an IPC event contract's handler signature.
 */
export type IpcEventHandler<T extends IpcEventContractBase<T>, K extends IpcEventNames<T>> = (...args: IpcEventParameters<T, K>) => void;

export type PromisedType<T> = T extends PromiseLike<infer U> ? U : T;

export type ConvertersArray = (((value: any) => any) | undefined | null)[];

type ParameterConverters<Source extends any[], Converters extends any[]> = Extract<{
    [P in keyof Source]: P extends keyof Converters ?
        Converters[P] extends ((value: infer In) => infer Out) ?
            [In | undefined] extends [Source[P]] ? Out | undefined :
            [In] extends [Source[P]] ? Out : never :
            Source[P] :
            Source[P]
}, readonly any[]>;