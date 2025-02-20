export interface IsStreamOptions {
  /**
   * When this option is `true`, the method returns `false` if the stream has already been closed.
   * @default true
   */
  checkOpen?: boolean
}

export function isStream(stream: any, { checkOpen = true }: IsStreamOptions = {}) {
  return stream !== null
    && typeof stream === 'object'
    && !!(stream.writable || stream.readable || !checkOpen || (stream.writable === undefined && stream.readable === undefined))
    && typeof stream.pipe === 'function'
}
