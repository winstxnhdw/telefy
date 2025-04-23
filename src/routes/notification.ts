import { get_config } from '@/config'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Bot, InputFile, InputMediaBuilder } from 'grammy'
import type { InputMediaDocument } from 'grammy/types'

const NotificationSchema = z.object({
  title: z.string().openapi({ example: 'Microsoft Teams' }),
  body: z.string().openapi({ example: 'Hello, world!' }),
  attachments: z
    .array(z.string())
    .optional()
    .openapi({ example: ['VGhpcyBpcyBteSBvcmlnaW5hbCBzdHJpbmcu'] }),
})

const ResponseSchema = z.object({
  message: z.string(),
})

const ResponseErrorSchema = z.object({
  error: z.literal('Invalid notification body!'),
})

const route = createRoute({
  method: 'post',
  path: '/notification',
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: NotificationSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema,
          example: {
            message: 'Successfully sent a notification.',
          },
        },
      },
      description: 'The response when a user has been successfully added.',
    },
    401: {
      content: {
        'text/plain': { schema: z.literal('Unauthorized') },
      },
      description: 'The response when the request is unauthorized.',
    },
    500: {
      content: {
        'application/json': { schema: ResponseErrorSchema },
      },
      description: 'The response when a user cannot be added.',
    },
  },
})

const base64_array_to_input_files = (base64_array: string[]): InputMediaDocument[] => {
  const input_files = []

  for (const base64 of base64_array) {
    const buffer = Buffer.from(base64, 'base64')
    input_files.push(InputMediaBuilder.document(new InputFile(new Uint8Array(buffer))))
  }

  return input_files
}

const send_message_with_attachment = async (
  bot: Bot,
  chat_id: number,
  title: string,
  body: string,
  attachments: string[],
) => {
  const message = await bot.api.sendMessage(chat_id, `${title}\n${body}`, { parse_mode: 'HTML' })

  await bot.api.sendMediaGroup(chat_id, base64_array_to_input_files(attachments), {
    reply_parameters: { message_id: message.message_id },
  })
}

const send_message = (bot: Bot, chat_id: number, title: string, body: string, attachments?: string[]) => {
  return !attachments
    ? bot.api.sendMessage(chat_id, `${title}\n${body}`, { parse_mode: 'HTML' })
    : send_message_with_attachment(bot, chat_id, title, body, attachments)
}

export const notification = new OpenAPIHono().openapi(route, async (context) => {
  const config = get_config(context.env)
  const bot = new Bot(config.BOT_TOKEN)
  const { title, body, attachments } = await context.req.json<z.infer<typeof NotificationSchema>>()

  await send_message(bot, config.CHAT_ID, title, body, attachments)

  return context.json({ message: 'Successfully sent a notification.' }, 200)
})
