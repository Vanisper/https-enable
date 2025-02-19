export interface ProjectOptions {
  /**
   * Project root directory. Can be an absolute path, or a path relative from
   * the location of the config file itself.
   * @default process.cwd()
   */
  root?: string
  /**
   * 由哪个文件导入，调用方的绝对路径
   * @description 可选，如果不传则会自动获取
   * @description 如要手动传递，则必须传入 `import.meta.url`
   * @default undefined
   */
  callerId?: string
  /**
   * 兜底未知文件作为 raw 处理
   */
  fallback?: boolean
}

export interface ImportGlobOptions<
  Eager extends boolean,
  AsType extends string,
> {
  /**
   * Import type for the import url.
   *
   * @deprecated Use `query` instead, e.g. `as: 'url'` -> `query: '?url', import: 'default'`
   */
  as?: AsType
  /**
   * Import as static or dynamic
   *
   * @default false
   */
  eager?: Eager
  /**
   * Import only the specific named export. Set to `default` to import the default export.
   */
  import?: string
  /**
   * Custom queries
   * @deprecated 暂时没有使用场景
   */
  query?: string | Record<string, string | number | boolean>
  /**
   * Search files also inside `node_modules/` and hidden directories (e.g. `.git/`). This might have impact on performance.
   *
   * @default false
   */
  exhaustive?: boolean
}

type Eager = boolean
type AsType = string
export type GeneralImportGlobOptions = ImportGlobOptions<Eager, AsType>

export interface KnownAsTypeMap {
  raw: string
  url: string
  worker: Worker
}

export interface ImportGlobFunction {
  /**
   * Import a list of files with a glob pattern.
   *
   * Overload 1: No generic provided, infer the type from `eager` and `as`
   */
  <
    Eager extends boolean,
    As extends string,
    T = As extends keyof KnownAsTypeMap ? KnownAsTypeMap[As] : unknown,
  >(
    glob: string | string[],
    options?: ImportGlobOptions<Eager, As> & ProjectOptions,
  ): (Eager extends true ? true : false) extends true
    ? Record<string, T>
    : Record<string, () => Promise<T>>
  /**
   * Import a list of files with a glob pattern.
   *
   * Overload 2: Module generic provided, infer the type from `eager: false`
   */
  <M>(
    glob: string | string[],
    options?: ImportGlobOptions<false, string> & ProjectOptions,
  ): Record<string, () => Promise<M>>
  /**
   * Import a list of files with a glob pattern.
   *
   * Overload 3: Module generic provided, infer the type from `eager: true`
   */
  <M>(
    glob: string | string[],
    options: ImportGlobOptions<true, string> & ProjectOptions,
  ): Record<string, M>
}
