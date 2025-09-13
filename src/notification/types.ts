import { t } from 'elysia';

export const NotificationSchema = t.Object({
  subject: t.String({ examples: ['Title'] }),
  body: t.String({ examples: ['This is the body of the notification.'] }),
});
