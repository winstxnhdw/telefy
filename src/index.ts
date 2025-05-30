import { notification } from '@/routes/notification'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { bearerAuth } from 'hono/bearer-auth'
import { cors } from 'hono/cors'

function main() {
  const openapi_documentation_route = '/openapi.json'
  const app = new OpenAPIHono().doc(openapi_documentation_route, {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'worker',
    },
  })

  app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  })

  app
    .get('/docs', swaggerUI({ url: openapi_documentation_route }))
    .use(cors())
    .use('/*', bearerAuth({ verifyToken: (token, context) => token === context.env.AUTH_TOKEN }))
    .route('/', notification)

  return app
}

export default main()
