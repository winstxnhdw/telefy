import { describe, expect, it, mock } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { app } from '@/app';

function get_auth_token() {
  return 'Valid AUTH_TOKEN';
}

function create_app() {
  const api = app({
    TELEGRAM_BOT_TOKEN: 'TELEGRAM_BOT_TOKEN',
    TELEGRAM_CHAT_ID: 'TELEGRAM_CHAT_ID',
    AUTH_TOKEN: get_auth_token(),
  });

  return treaty(api);
}

describe('notification', () => {
  const api = create_app();

  mock.module('@/notification/service', () => {
    return {
      notify: async () => {},
    };
  });

  it('Incorrect AUTH_TOKEN should be rejected', async () => {
    const { status } = await api.post(
      { subject: 'Title', body: 'Hello!' },
      { headers: { Authorization: 'Invalid AUTH_TOKEN' } },
    );

    expect(status).toBe(401);
  });

  it('Correct AUTH_TOKEN should be accepted', async () => {
    const { status } = await api.post(
      { subject: 'Title', body: 'Hello!' },
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get_auth_token()}` } },
    );

    expect(status).toBe(200);
  });
});
