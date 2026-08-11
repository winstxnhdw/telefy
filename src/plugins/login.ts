import { Elysia } from 'elysia';
import type { Bindings } from '@/types';

export function login() {
  return new Elysia({ name: 'login' })
    .decorate('env', null as unknown as Bindings)
    .onBeforeHandle({ as: 'scoped' }, ({ env, request, set, status }) => {
      if (request.headers.get('Authorization') === `Basic ${btoa(`${env.OPENAPI_USERNAME}:${env.OPENAPI_PASSWORD}`)}`)
        return;

      set.headers['WWW-Authenticate'] = 'Basic realm="OpenAPI", charset="UTF-8"';
      return status(401, 'Unauthorized');
    });
}
