import Elysia from 'elysia';
import { Bot } from 'grammy';
import type { UserFromGetMe } from 'grammy/types';
import type { Bindings } from '@/types';

function factory({ env }: { env: Bindings }) {
  const botInfo: UserFromGetMe = {
    id: 7983020807,
    is_bot: true,
    first_name: 'telefy',
    username: 'telefynotifybot',
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    can_connect_to_business: false,
    has_main_web_app: true,
    has_topics_enabled: false,
    allows_users_to_create_topics: false,
    can_manage_bots: false,
    supports_join_request_queries: false,
  };

  return {
    bot: new Bot(env.TELEGRAM_BOT_TOKEN, { botInfo: botInfo }),
  };
}

export function grammy() {
  return new Elysia()
    .decorate('env', null as unknown as Bindings)
    .derive(factory)
    .as('scoped');
}
