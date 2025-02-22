import ms from 'ms'
import format from '../format'

/*
 * function ms (info)
 * Returns an `info` with a `ms` property. The `ms` property holds the value
 * of the time difference between two calls in milliseconds.
 */
let prevTime: number

export default format((info) => {
  const curr = +new Date()
  const diff = curr - (prevTime || curr)
  prevTime = curr
  info.ms = `+${ms(diff)}`

  return info
})
