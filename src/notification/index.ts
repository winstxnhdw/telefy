import { bearer } from '@elysiajs/bearer';
import { Elysia } from 'elysia';
import { notify } from '@/notification/service';
import { NotificationSchema } from '@/notification/types';
import { grammy } from '@/plugins';
import type { Bindings } from '@/types';

export function notification() {
  const controller = new Elysia()
    .decorate('env', null as unknown as Bindings)
    .use(bearer())
    .use(grammy())
    .post('/', ({ env, body, bot }) => notify(bot, env.TELEGRAM_CHAT_ID, body), {
      parse: 'multipart/form-data',
      body: NotificationSchema,
      detail: { security: [{ Bearer: [] }] },
      beforeHandle({ env, bearer, set, status }) {
        if (bearer === env.AUTH_TOKEN) return;

        set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;
        return status(401, 'Unauthorized');
      },
    });

  return controller;
}
