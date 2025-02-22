export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type AsyncifyFunction<T extends (...args: any) => any> =
  T extends (...args: infer Args) => infer Return
    ? (...args: Args) => Promise<Return>
    : never

// 处理重载函数(三重)
export type AsyncFunction<T> = T extends {
  (...args: infer A1): infer R1
  (...args: infer A2): infer R2
  (...args: infer A3): infer R3
}
  ? {
      (...args: A1): Promise<R1>
      (...args: A2): Promise<R2>
      (...args: A3): Promise<R3>
    }
  : T extends (...args: any[]) => any
    ? AsyncifyFunction<T>
    : never

export type EnumToRecord<EnumType> = {
  [K in keyof EnumType]: EnumType[K];
}

export type IsTuple<T> = T extends readonly [any, ...any[]] ? true : false

export type MapTuple<T extends ReadonlyArray<string>> = {
  [K in keyof T & `${number}` as T[K]]: K extends `${infer N extends number}` ? N : never;
}

export type MapArray<T extends string | number | symbol> = {
  [K in T]: number;
}

export type PickElements<
  T extends ReadonlyArray<string>,
  K extends string,
> = T extends readonly [infer First extends string, ...infer Rest extends ReadonlyArray<string>]
  ? First extends K
    ? [First, ...PickElements<Rest, K>]
    : PickElements<Rest, K>
  : []

export type OmitElements<
  T extends ReadonlyArray<string>,
  K extends string,
> = T extends readonly [infer First, ...infer Rest extends ReadonlyArray<string>]
  ? First extends K
    ? OmitElements<Rest, K>
    : [First, ...OmitElements<Rest, K>]
  : []

export type Zip<
  T extends ReadonlyArray<string>,
  V extends { [K in keyof T]: any },
> = {
  [K in keyof T & `${number}` as T[K]]: V[K]
}

/**
 * 将元组中的字面量转为大写
 */
export type UppercaseUnion<T extends ReadonlyArray<string>> = Uppercase<T[number]>
