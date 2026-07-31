import { t } from 'elysia';

const subject = t.String({ examples: ['Title'], minLength: 1, maxLength: 96 });
const body = (maxLength: number) => t.String({ examples: ['This is the body of the notification.'], maxLength });

export const NotificationSchema = t.Union([
  t.Object({ subject, body: body(4000), attachments: t.Optional(t.Never()) }),
  t.Object({ subject, body: body(924), attachments: t.Files({ minItems: 1 }) }),
]);
