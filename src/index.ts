import { notification } from '@/notification';
import type { Bindings } from '@/types/bindings';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';

function main(env: Bindings) {
  const openapiDocumentationRoute = '/openapi.json';
  const scalarPlugin = openapi({
    path: '/schema/scalar',
    scalar: { url: openapiDocumentationRoute },
    specPath: openapiDocumentationRoute,
    documentation: {
      info: {
        title: 'telefy',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  return new Elysia({ normalize: false, aot: false }).decorate('env', env).use(scalarPlugin).use(cors()).use(notification());
}

export default {
  fetch: (request: Request, env: Bindings) => main(env).handle(request),
};
