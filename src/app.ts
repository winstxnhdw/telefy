import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { health } from '@/health';
import { notification } from '@/notification';
import { auth } from '@/plugins';
import { scalar } from '@/scalar';
import type { Bindings } from '@/types';

export function app(env: Bindings) {
  return new Elysia().decorate('env', env).use(cors()).use(scalar()).use(auth()).use(health()).use(notification());
}
