import { createClient } from 'redis'
import config from './config'

const redis = createClient({
  url: config.redis.url,
})

export default redis
