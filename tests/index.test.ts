import { describe, expect, it, mock } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { app } from '@/app';
import type { Bindings } from '@/types';

mock.module('@/notification/service', () => ({
  notify: async (_bot: unknown, _chatId: string, notification: { subject: string }) => {
    if (notification.subject === 'Notification failed') throw new Error('Notification failed');
  },
}));

type OpenapiSpecification = {
  paths: {
    '/': { post: { security: Array<Record<string, unknown>> } };
    '/health': { get: { security: Array<Record<string, unknown>> } };
  };
};

function createBindings(): Bindings {
  return {
    TELEGRAM_BOT_TOKEN: 'TELEGRAM_BOT_TOKEN',
    TELEGRAM_CHAT_ID: 'TELEGRAM_CHAT_ID',
    AUTH_TOKEN: 'Valid AUTH_TOKEN',
    OPENAPI_USERNAME: 'Valid OPENAPI_USERNAME',
    OPENAPI_PASSWORD: 'Valid OPENAPI_PASSWORD',
  };
}

function createServer() {
  return app(createBindings());
}

function createApi() {
  return treaty(createServer());
}

function createBasicHeaders() {
  const bindings = createBindings();
  return { Authorization: `Basic ${btoa(`${bindings.OPENAPI_USERNAME}:${bindings.OPENAPI_PASSWORD}`)}` };
}

function createBearerHeaders() {
  return { Authorization: `Bearer ${createBindings().AUTH_TOKEN}` };
}

function createFileStub() {
  return new File(['file contents'], 'file.txt', { type: 'text/plain' });
}

async function createOpenapiSpecification() {
  const response = await createServer().handle(
    new Request('http://localhost/openapi.json', { headers: createBasicHeaders() }),
  );
  const responseBody = await response.json();
  return responseBody as OpenapiSpecification;
}

describe('Scalar', () => {
  describe('when Basic credentials are missing', () => {
    it('responds with an authentication challenge', async () => {
      const response = await createServer().handle(new Request('http://localhost/schema/scalar'));

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="OpenAPI", charset="UTF-8"');
    });
  });

  describe('when Basic credentials are valid', () => {
    it('serves the UI', async () => {
      const response = await createServer().handle(
        new Request('http://localhost/schema/scalar', { headers: createBasicHeaders() }),
      );

      expect(response.status).toBe(200);
    });

    it('serves the OpenAPI specification', async () => {
      const response = await createServer().handle(
        new Request('http://localhost/openapi.json', { headers: createBasicHeaders() }),
      );

      expect(response.status).toBe(200);
    });
  });
});

describe('OpenAPI specification', () => {
  it('describes health as requiring Bearer authentication', async () => {
    const specification = await createOpenapiSpecification();

    expect(specification.paths['/health'].get.security).toEqual([{ bearerAuth: [] }]);
  });

  it('describes notifications as requiring Bearer authentication', async () => {
    const specification = await createOpenapiSpecification();

    expect(specification.paths['/'].post.security).toEqual([{ bearerAuth: [] }]);
  });
});

describe('GET /health', () => {
  describe('when Bearer credentials are missing', () => {
    it('rejects the request', async () => {
      const { status } = await createApi().health.get();

      expect(status).toBe(401);
    });
  });

  describe('when Bearer credentials are valid', () => {
    it('accepts the request', async () => {
      const { status } = await createApi().health.get({ headers: createBearerHeaders() });

      expect(status).toBe(200);
    });
  });
});

describe('POST /', () => {
  describe('when Bearer credentials are invalid', () => {
    it('rejects the request', async () => {
      const { status } = await createApi().post(
        { subject: 'Title', body: 'Hello!', attachments: [createFileStub()] },
        { headers: { Authorization: 'Bearer Invalid AUTH_TOKEN' } },
      );

      expect(status).toBe(401);
    });
  });

  describe('when Bearer credentials are valid', () => {
    it('accepts the request', async () => {
      const { status } = await createApi().post(
        { subject: 'Title', body: 'Hello!', attachments: [createFileStub()] },
        { headers: createBearerHeaders() },
      );

      expect(status).toBe(200);
    });
  });

  describe('when the notification has no attachments', () => {
    it('accepts a 4000-character body', async () => {
      const form = new FormData();
      form.set('subject', 'Title');
      form.set('body', 'x'.repeat(4000));

      const response = await createServer().handle(
        new Request('http://localhost/', {
          method: 'POST',
          headers: createBearerHeaders(),
          body: form,
        }),
      );

      expect(response.status).toBe(200);
    });
  });

  describe('when the notification has attachments', () => {
    it('rejects empty attachments', async () => {
      const { status } = await createApi().post(
        { subject: 'Title', body: 'Hello!', attachments: [new File([], 'empty.txt', { type: 'text/plain' })] },
        { headers: createBearerHeaders() },
      );

      expect(status).toBe(422);
    });

    it('rejects a caption longer than 924 characters', async () => {
      const { status } = await createApi().post(
        { subject: 'Title', body: 'x'.repeat(925), attachments: [createFileStub()] },
        { headers: createBearerHeaders() },
      );

      expect(status).toBe(422);
    });
  });

  describe('when notification delivery fails', () => {
    it('returns the error', async () => {
      const { error, status } = await createApi().post(
        { subject: 'Notification failed', body: 'Hello!', attachments: [createFileStub()] },
        { headers: createBearerHeaders() },
      );

      expect(status).toBe(500);
      expect(String(error?.value)).toBe('Error: Notification failed');
    });
  });
});
