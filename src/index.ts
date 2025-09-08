import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { opentelemetry } from '@elysiajs/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { Elysia } from 'elysia';
import { notification } from '@/notification';
import type { Bindings } from '@/types/bindings';

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

  const openTelemetry = opentelemetry({
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
          headers: {
            Authorization: env.OTEL_EXPORTER_OTLP_TOKEN,
          },
        }),
      ),
    ],
  });

  return new Elysia({ aot: false })
    .decorate('env', env)
    .use(openTelemetry)
    .use(scalarPlugin)
    .use(cors())
    .use(notification());
}

export default {
  fetch: (request: Request, env: Bindings) => main(env).handle(request),
};
