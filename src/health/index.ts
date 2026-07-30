import { bearer } from '@elysiajs/bearer';
import { Elysia } from 'elysia';

export function health() {
  const controller = new Elysia().use(bearer()).get('/health', () => ({
    schemaVersion: 1,
    label: 'telefy',
    message: 'online',
  }));

  return controller;
}
