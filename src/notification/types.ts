import { t } from 'elysia';

export const NotificationSchema = t.Object({
  subject: t.String({ examples: ['Title'], minLength: 1, maxLength: 96 }),
  body: t.String({ examples: ['This is the body of the notification.'], minLength: 1, maxLength: 4000 }),
  attachments: t.Optional(t.Files({ minItems: 1 })),
});
