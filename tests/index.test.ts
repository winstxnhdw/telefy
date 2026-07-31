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

function getBindings() {
  return {
    TELEGRAM_BOT_TOKEN: 'TELEGRAM_BOT_TOKEN',
    TELEGRAM_CHAT_ID: 'TELEGRAM_CHAT_ID',
    AUTH_TOKEN: getAuthToken(),
  };
}

function createApp() {
  return treaty(app(getBindings()));
}

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
    expect(String(error?.value)).toBe('Notification failed');
  });
});
