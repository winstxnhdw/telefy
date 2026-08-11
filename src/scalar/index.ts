import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { login } from '@/plugins';

export function scalar() {
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
          },
        },
      },
    },
  });

  return new Elysia().use(login()).use(scalarPlugin);
}
