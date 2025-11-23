import Elysia from 'elysia';

export function health() {
  const controller = new Elysia().get('/health', () => ({
    schemaVersion: 1,
    label: 'telefy',
    message: 'online',
  }));

  return controller;
}
