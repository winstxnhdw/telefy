import { Bot, InputFile, InputMediaBuilder } from 'grammy';
import telegramify from 'telegramify-markdown';
import type { NotificationSchema } from '@/notification/types';

export async function notify(botToken: string, chatId: string, notification: typeof NotificationSchema.static) {
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

  const bot = new Bot(botToken, { botInfo: botInfo });
  const attachments = notification.attachments ?? [];
  const message = `*${telegramify(notification.subject.toUpperCase(), 'escape')}*\\-\\-\\-\n${telegramify(notification.body, 'escape')}`;

  if (attachments.length === 0) {
    await bot.api.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
  } else {
    const attachmentBytes = await Promise.all(attachments.map((file) => file.bytes()));
    const files = attachmentBytes.map((file, i) =>
      InputMediaBuilder.document(new InputFile(file, attachments[i]?.name)),
    );

    const lastFile = files.at(-1);

    if (lastFile === undefined) {
      return;
    }

    lastFile.caption = message;
    lastFile.parse_mode = 'MarkdownV2';

    await bot.api.sendMediaGroup(chatId, files);
  }
}
