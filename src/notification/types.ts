import { t } from 'elysia';

export const Notification = t.Object({
  subject: t.String({ examples: ['Title'] }),
  body: t.String({ examples: [String.raw`This is the body of the notification\.`] }),
});
