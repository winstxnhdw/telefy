import { Bot } from 'grammy';
import telegramify from 'telegramify-markdown';
import type { Notification } from '@/notification/types';

export async function notify(botToken: string, chatId: string, notification: typeof Notification.static) {
  const bot = new Bot(botToken);
  const message = `*${telegramify(notification.subject.toUpperCase(), 'escape')}*\\-\\-\\-\n${telegramify(notification.body, 'escape')}`;
  await bot.api.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
}
