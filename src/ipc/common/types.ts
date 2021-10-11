/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Constructor } from "service-composition";
export declare type NonConstructor<T> = T & ([T] extends [new (...args: any[]) => any] ? never : unknown);
export declare type MatchingKey<T, K extends keyof T, TMatch> = K & ([TMatch] extends [T[K]] ? unknown : never);
export declare type MatchingParameter<F extends Constructor<any[], any>, I extends number, TMatch> = I & ([TMatch] extends [ConstructorParameters<F>[I]] ? unknown : never);