import { Elysia } from 'elysia';
import { notify } from '@/notification/service';
import { NotificationSchema } from '@/notification/types';
import { grammy } from '@/plugins';
import type { Bindings } from '@/types';

export function notification() {
  const controller = new Elysia()
    .decorate('env', null as unknown as Bindings)
    .use(grammy())
    .post('/', ({ env, body, bot }) => notify(bot, env.TELEGRAM_CHAT_ID, body), {
      parse: 'multipart/form-data',
      body: NotificationSchema,
      error: ({ error }) => String(error),
    });

  return controller;
}
