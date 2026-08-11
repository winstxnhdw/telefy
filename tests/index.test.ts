import { afterEach, describe, expect, it, mock } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { app } from '@/app';

let notificationError: Error | undefined;

mock.module('@/notification/service', () => ({
  notify: async () => {
    if (notificationError !== undefined) throw notificationError;
  },
}));

function getAuthToken() {
  return 'Valid AUTH_TOKEN';
}

function getOpenapiUsername() {
  return 'Valid OPENAPI_USERNAME';
}

function getOpenapiPassword() {
  return 'Valid OPENAPI_PASSWORD';
}

function getBindings() {
  return {
    TELEGRAM_BOT_TOKEN: 'TELEGRAM_BOT_TOKEN',
    TELEGRAM_CHAT_ID: 'TELEGRAM_CHAT_ID',
    AUTH_TOKEN: getAuthToken(),
    OPENAPI_USERNAME: getOpenapiUsername(),
    OPENAPI_PASSWORD: getOpenapiPassword(),
  };
}

function createApp() {
  return treaty(app(getBindings()));
}

describe('OpenAPI', () => {
  it('Requests without Basic authentication should be rejected', async () => {
    const response = await app(getBindings()).handle(new Request('http://localhost/schema/scalar'));

    expect(response.status).toBe(401);
    expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="OpenAPI", charset="UTF-8"');
  });

  it('Correct Basic authentication should be accepted for the UI and specification', async () => {
    const headers = { Authorization: `Basic ${btoa(`${getOpenapiUsername()}:${getOpenapiPassword()}`)}` };
    const server = app(getBindings());
    const [uiResponse, specificationResponse] = await Promise.all([
      server.handle(new Request('http://localhost/schema/scalar', { headers })),
      server.handle(new Request('http://localhost/openapi.json', { headers })),
    ]);

    expect(uiResponse.status).toBe(200);
    expect(specificationResponse.status).toBe(200);
  });
});

describe('health', () => {
  const api = createApp();

  it('Requests without an AUTH_TOKEN should be rejected', async () => {
    const { status } = await api.health.get();

    expect(status).toBe(401);
  });

  it('Correct AUTH_TOKEN should be accepted', async () => {
    const { status } = await api.health.get({
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });

    expect(status).toBe(200);
  });
});

describe('notification', () => {
  const api = createApp();
  const fileStub = new File(['file contents'], 'file.txt', { type: 'text/plain' });

  afterEach(() => {
    notificationError = undefined;
  });

  it('Incorrect AUTH_TOKEN should be rejected', async () => {
    const { status } = await api.post(
      { subject: 'Title', body: 'Hello!', attachments: [fileStub] },
      { headers: { Authorization: 'Invalid AUTH_TOKEN' } },
    );

    expect(status).toBe(401);
  });

  it('Correct AUTH_TOKEN should be accepted', async () => {
    const { status } = await api.post(
      { subject: 'Title', body: 'Hello!', attachments: [fileStub] },
      { headers: { Authorization: `Bearer ${getAuthToken()}` } },
    );

    expect(status).toBe(200);
  });

  it('Long bodies without attachments should be accepted', async () => {
    const form = new FormData();
    form.set('subject', 'Title');
    form.set('body', 'x'.repeat(4000));

    const response = await app(getBindings()).handle(
      new Request('http://localhost/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: form,
      }),
    );

    expect(response.status).toBe(200);
  });

  it('Long captions should be rejected', async () => {
    const { status } = await api.post(
      { subject: 'Title', body: 'x'.repeat(925), attachments: [fileStub] },
      { headers: { Authorization: `Bearer ${getAuthToken()}` } },
    );

    expect(status).toBe(422);
  });

  it('Notification errors should be propagated', async () => {
    notificationError = new Error('Notification failed');

    const { error, status } = await api.post(
      { subject: 'Title', body: 'Hello!', attachments: [fileStub] },
      { headers: { Authorization: `Bearer ${getAuthToken()}` } },
    );

    expect(status).toBe(500);
    expect(String(error?.value)).toBe('Error: Notification failed');
  });
});
