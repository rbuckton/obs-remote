export function sameMap<T>(array: readonly T[], callback: (value: T, index: number) => T): readonly T[];
export function sameMap<T>(array: readonly T[] | undefined, callback: (value: T, index: number) => T): readonly T[] | undefined;
export function sameMap<T>(array: readonly T[] | undefined, callback: (value: T, index: number) => T): readonly T[] | undefined {
    if (array) {
        let result: T[] | undefined;
        for (let i = 0; i < array.length; i++) {
            const value = array[i];
            const visited = callback(value, i);
            if (result || value !== visited) {
                result ||= array.slice(0, i);
                result.push(visited);
            }
        }
        return result || array;
    }
}

export function sameFilter<T>(array: readonly T[], callback: (value: T, index: number) => boolean): readonly T[];
export function sameFilter<T>(array: readonly T[] | undefined, callback: (value: T, index: number) => boolean): readonly T[] | undefined;
export function sameFilter<T>(array: readonly T[] | undefined, callback: (value: T, index: number) => boolean): readonly T[] | undefined {
    if (array) {
        let result: T[] | undefined;
        for (let i = 0; i < array.length; i++) {
            const value = array[i];
            const matched = callback(value, i);
            if (result || !matched) {
                result ||= array.slice(0, i);
                if (matched) {
                    result.push(value);
                }
            }
        }
        return result || array;
    }
}
