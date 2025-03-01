import jsonStringify from 'safe-stable-stringify'
import { MESSAGE } from '../../triple-beam'
import format from '../format'

/*
 * function logstash (info)
 * Returns a new instance of the LogStash Format that turns a
 * log `info` object into pure JSON with the appropriate logstash
 * options. This was previously exposed as { logstash: true }
 * to transports in `winston < 3.0.0`.
 */
export default format((info) => {
  const logstash: Record<string, any> = {}

  if (info.message) {
    logstash['@message'] = info.message
    delete info.message
  }

  if (info.timestamp) {
    logstash['@timestamp'] = info.timestamp
    delete info.timestamp
  }

  logstash['@fields'] = info
  info[MESSAGE] = jsonStringify(logstash)
  return info
})
