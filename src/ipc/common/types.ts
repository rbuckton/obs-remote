import { Constructor } from "service-composition";
export declare type NonConstructor<T> = T & ([T] extends [new (...args: any[]) => any] ? never : unknown);
export declare type MatchingKey<T, K extends keyof T, TMatch> = K & ([TMatch] extends [T[K]] ? unknown : never);
export declare type MatchingParameter<F extends Constructor<any[], any>, I extends number, TMatch> = I & ([TMatch] extends [ConstructorParameters<F>[I]] ? unknown : never);