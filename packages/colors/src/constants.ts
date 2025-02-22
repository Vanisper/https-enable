// See: https://github.com/nodejs/node/blob/main/lib/internal/util/inspect.js#L262~L273
export const ansiRegStr = '[\\u001B\\u009B][[\\]()#;?]*'
  + '(?:(?:(?:(?:;[-\\w/#&.:=?%@~]+)+'
  + '|[a-zA-Z\\d]+(?:;[-\\w/#&.:=?%@~]*)*)?'
  + '(?:\\u0007|\\u001B\\u005C|\\u009C))'
  + '|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?'
  + '[\\dA-PR-TZcf-nq-uy=><~]))'
