import format from '../format'

/*
 * function align (info)
 * Returns a new instance of the align Format which adds a `\t`
 * delimiter before the message to properly align it in the same place.
 * It was previously { align: true } in winston < 3.0.0
 */
export default format((info) => {
  info.message = `\t${info.message}`
  return info
})
