// declare type DeepReadonly<T> = T extends Function
// 	? T
// 	: T extends object
// 	? {
// 			readonly [K in keyof T]: DeepReadonly<T[K]>;
// 	  }
// 	: T;

export type Nullable<T> = T | null;

export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
	? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
	: Lowercase<S>;

export type KeysToCamelCase<T> = {
	[K in keyof T as CamelCase<string & K>]: T[K] extends {} ? KeysToCamelCase<T[K]> : T[K];
};

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number;
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never;
export type FixedLengthArray<T extends any[]> = Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>> & {
	[Symbol.iterator]: () => IterableIterator<ArrayItems<T>>;
};
