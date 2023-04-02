import { Color, Logger } from '@starkow/logger'
import { oneLine } from 'common-tags'
import { CallbackQueryMiddleware, Context } from 'grammy'

import { decrypt, keyDecrypt } from '../utilities'
import redis from '../redis'

const logger = Logger.create('middleware:callbackQuery', Color.Green)

export const callbackQueryMiddleware: CallbackQueryMiddleware<Context> = async (context) => {
  const [command, payload] = context.callbackQuery.data.split(':')

  switch (command) {
  case 'read': {
    const messageData = await redis.get(`message:${payload}`).then((r) => {
      return r !== null ? JSON.parse(r) : null
    })

    if (!messageData) {
      await context.answerCallbackQuery({
        text: 'Message not found',
      })

      return
    }

    const { userInputType, storeKey, cipherText } = messageData
    const userKey = userInputType === 'username'
      ? context.from.username!.toLowerCase()
      : context.from.id.toString()

    try {
      const keyData = keyDecrypt(userKey, storeKey).toString('utf-8')
      const [key, iv] = keyData.split(':').map((kd) => Buffer.from(kd, 'hex'))

      const message = decrypt(key, iv, cipherText).toString('utf-8')

      if (messageData.isOnetime) {
        await Promise.all([
          context.editMessageText(oneLine`
            <i>Message has been readed at: ${new Date().toUTCString()}</i>
          `, {
            parse_mode: 'HTML',
          }),
          redis.del(`message:${payload}`),
        ])
      }

      context.answerCallbackQuery({
        text: message,
        show_alert: true,
      })
    } catch (error: any) {
      if (error.code && !['ERR_OSSL_BAD_DECRYPT'].includes(error.code)) {
        logger.warn('Unexpected error:', error)
      }

      context.answerCallbackQuery({
        text: 'Failed to decrypt key, perhaps you are not the recipient?',
        show_alert: true,
      })
    }

    break
  }
  default:
    context.answerCallbackQuery()
    break
  }
}
