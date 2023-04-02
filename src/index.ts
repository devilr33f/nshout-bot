import { Logger, Color, TextStyle } from '@starkow/logger'
import { oneLine } from 'common-tags'
import { Bot } from 'grammy'

import { callbackQueryMiddleware, inlineQueryMiddleware } from './middlewares'
import config from './config'
import redis from './redis'

const logger = Logger.create('index', Color.Gray)
const telegram = new Bot(config.telegram.token)

telegram.catch((error) => {
  logger.warn('Unexpected error in event processing:', error)
})

telegram.on('inline_query', inlineQueryMiddleware)
// * cuz i don't use context.match and i didn't want to guess typings for this, KEKW
// @ts-ignore
telegram.on('callback_query:data', callbackQueryMiddleware)

const init = async () => {
  logger(oneLine`
    starting
    ${Logger.color(config.package.name, Color.Blue, TextStyle.Bold)}
    ${Logger.color(`(${config.package.version})`, Color.Blue)}
    in ${Logger.color(config.package.mode, Color.Blue, TextStyle.Bold)} mode...
  `)

  await redis.connect()
  telegram.start({
    allowed_updates: ['callback_query', 'inline_query'],
    drop_pending_updates: true,
    onStart: (botInfo) => {
      logger(oneLine`
        Started as ${Logger.color(botInfo.first_name, Color.Blue)}
        (${Logger.color(`@${botInfo.username}`, Color.Blue)})
      `)
    },
  })
}

init()
  .catch(Logger.create('error', Color.Red, TextStyle.Bold).error)
