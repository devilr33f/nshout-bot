import { Context, InlineKeyboard, InlineQueryMiddleware } from 'grammy'
import { InlineQueryResult } from 'grammy/types'
import { stripIndents } from 'common-tags'
import { randomUUID } from 'crypto'

import { messageTooLong, usageResults, usernameTooLong, encrypt, keyEncrypt } from '../utilities'
import redis from '../redis'

export const inlineQueryMiddleware: InlineQueryMiddleware<Context> = async (context) => {
  const query = context.inlineQuery.query

  if (!query) {
    await context.answerInlineQuery(usageResults.userNeeded, {
      cache_time: 1,
      is_personal: true,
    })

    return
  }

  const [user, ...text] = query.split(' ')

  if (!text.length) {
    await context.answerInlineQuery(usageResults.messageNeeded, {
      cache_time: 1,
      is_personal: true,
    })

    return
  }

  const isOneTime = user.includes('!')
  const username = user.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
  const userInputType = isNaN(parseInt(username, 10)) ? 'username' : 'id'

  if (!username.length) {
    await context.answerInlineQuery(usageResults.userNeeded, {
      cache_time: 1,
      is_personal: true,
    })

    return
  }

  if (username.length > 32) {
    await context.answerInlineQuery([usernameTooLong], {
      cache_time: 1,
      is_personal: true,
    })

    return
  }

  if (text.join(' ').length > 200) {
    await context.answerInlineQuery([messageTooLong], {
      cache_time: 1,
      is_personal: true,
    })

    return
  }

  const { key, iv, cipherText } = encrypt(text.join(' '))
  const storeKey = keyEncrypt(username, key, iv).toString('base64')

  const messageId = randomUUID()
  await redis.set(`message:${messageId}`, JSON.stringify({
    userInputType,
    isOnetime: isOneTime,
    storeKey,
    cipherText: cipherText.toString('base64'),
  }))

  const inlineResult: InlineQueryResult = {
    type: 'article',
    id: messageId,
    title: '🔐 Click here to send message',
    input_message_content: {
      message_text: stripIndents`
        🔐 <b>A whisper message to ${userInputType === 'username' ? `@${username}` : `user with ID: <code>${username}</code>`}</b>
        <i>Only he/she can read this</i>
      `,
      parse_mode: 'HTML',
    },
    reply_markup: new InlineKeyboard().text('Read', `read:${messageId}`),
  }

  context.answerInlineQuery([inlineResult], {
    cache_time: 1,
    is_personal: true,
  })
}
