import { bearer } from '@elysiajs/bearer';
import { Elysia } from 'elysia';
import type { Bindings } from '@/types';

export function auth() {
  return new Elysia({ name: 'auth' })
    .decorate('env', null as unknown as Bindings)
    .use(bearer())
    .onBeforeHandle({ as: 'scoped' }, ({ bearer, env, set, status }) => {
      if (bearer === env.AUTH_TOKEN) return;

      set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;
      return status(401, 'Unauthorized');
    });
}
