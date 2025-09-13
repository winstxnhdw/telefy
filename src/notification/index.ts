import { bearer } from '@elysiajs/bearer';
import { Elysia } from 'elysia';
import { notify } from '@/notification/service';
import { NotificationSchema } from '@/notification/types';
import type { Bindings } from '@/types';

export function notification() {
  const controller = new Elysia()
    .use(bearer())
    .decorate('env', null as unknown as Bindings)
    .post('/', ({ env, body }) => notify(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, body), {
      body: NotificationSchema,
      detail: { security: [{ bearerAuth: [] }] },
      beforeHandle({ env, bearer, set, status }) {
        if (bearer === env.AUTH_TOKEN) return;

        set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;
        return status(401, 'Unauthorized');
      },
    });

  return controller;
}
