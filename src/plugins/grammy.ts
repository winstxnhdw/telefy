import Elysia from 'elysia';
import { Bot } from 'grammy';

interface GrammyEnv {
  TELEGRAM_BOT_TOKEN: string;
}

function factory({ env }: { env: GrammyEnv }) {
  const botInfo = {
    id: 7983020807,
    is_bot: true,
    first_name: 'telefy',
    username: 'telefynotifybot',
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    can_connect_to_business: false,
    has_main_web_app: true,
  } as const;

  return {
    bot: new Bot(env.TELEGRAM_BOT_TOKEN, { botInfo: botInfo }),
  };
}
export function grammy() {
  return new Elysia()
    .decorate('env', null as unknown as GrammyEnv)
    .derive(factory)
    .as('scoped');
}
