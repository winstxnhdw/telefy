import type { Bindings } from 'hono/types'
import { coerce, object, string } from 'zod'

export const get_config = (environment: Bindings | undefined) =>
  object({
    BOT_TOKEN: string().regex(/^[0-9]+:[a-zA-Z0-9_-]+$/),
    CHAT_ID: coerce.number(),
    AUTH_TOKEN: string(),
  }).parse(environment)
