import { describe, expect, it, mock } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { app } from '@/app';

function getAuthToken() {
  return 'Valid AUTH_TOKEN';
}

function createApp() {
  const api = app({
    TELEGRAM_BOT_TOKEN: 'TELEGRAM_BOT_TOKEN',
    TELEGRAM_CHAT_ID: 'TELEGRAM_CHAT_ID',
    AUTH_TOKEN: getAuthToken(),
  });

  return treaty(api);
}

describe('notification', () => {
  const api = createApp();
  const fileStub = new File(['file contents'], 'file.txt', { type: 'text/plain' });

  mock.module('@/notification/service', () => {
    return {
      notify: async () => {},
    };
  });

  it('Incorrect AUTH_TOKEN should be rejected', async () => {
    const { status } = await api.post(
      { subject: 'Title', body: 'Hello!', attachments: [fileStub] },
      { headers: { Authorization: 'Invalid AUTH_TOKEN' } },
    );

    expect(status).toBe(401);
  });

  it('Correct AUTH_TOKEN should be accepted', async () => {
    const { status, error } = await api.post(
      { subject: 'Title', body: 'Hello!', attachments: [fileStub] },
      { headers: { Authorization: `Bearer ${getAuthToken()}` } },
    );

    expect(status).toBe(200);
  });
});
