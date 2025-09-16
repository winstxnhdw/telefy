import { Bot, InputFile, InputMediaBuilder } from 'grammy';
import telegramify from 'telegramify-markdown';
import type { NotificationSchema } from '@/notification/types';

export async function notify(botToken: string, chatId: string, notification: typeof NotificationSchema.static) {
  const bot = new Bot(botToken);
  const attachments = notification.attachments ?? [];
  const message = `*${telegramify(notification.subject.toUpperCase(), 'escape')}*\\-\\-\\-\n${telegramify(notification.body, 'escape')}`;

  if (attachments.length === 0) {
    await bot.api.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
  } else {
    const attachmentBytes = await Promise.all(attachments.map((file) => file.bytes()));
    const files = attachmentBytes.map((file, i) =>
      InputMediaBuilder.document(
        new InputFile(file, attachments[i]?.name),
        i === attachments.length - 1 ? { caption: message, parse_mode: 'MarkdownV2' } : {},
      ),
    );

    await bot.api.sendMediaGroup(chatId, files);
  }
}
