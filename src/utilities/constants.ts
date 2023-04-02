import { InlineQueryResult } from 'grammy/types'

export const usageResults: Record<string, InlineQueryResult[]> = {
  userNeeded: [
    {
      type: 'article',
      id: 'usage-user',
      title: 'Usage:',
      description: 'Enter the username or ID of the message recipient',
      input_message_content: {
        message_text: 'nothing to see here.',
      },
    },
    {
      type: 'article',
      id: 'usage-hint-onetime',
      title: 'Hint:',
      description: 'You can add "!" at the beginning of the username to make your message disposable',
      input_message_content: {
        message_text: 'nothing to see here.',
      },
    },
  ],
  messageNeeded: [
    {
      type: 'article',
      id: 'usage-message',
      title: 'Usage:',
      description: 'Enter the text of the message you want to send',
      input_message_content: {
        message_text: 'nothing to see here.',
      },
    },
  ],
}

export const messageTooLong: InlineQueryResult = {
  type: 'article',
  id: 'message-too-long',
  title: 'Error',
  description: 'Message is too long',
  input_message_content: {
    message_text: 'nothing to see here.',
  },
}

export const usernameTooLong: InlineQueryResult = {
  type: 'article',
  id: 'username-too-long',
  title: 'Error',
  description: 'Username is too long',
  input_message_content: {
    message_text: 'nothing to see here.',
  },
}
