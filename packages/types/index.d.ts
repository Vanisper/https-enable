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
