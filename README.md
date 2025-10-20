# telefy

[![main.yml](https://github.com/winstxnhdw/telefy/actions/workflows/main.yml/badge.svg)](https://github.com/winstxnhdw/telefy/actions/workflows/main.yml)
[![deploy.yml](https://github.com/winstxnhdw/telefy/actions/workflows/deploy.yml/badge.svg)](https://github.com/winstxnhdw/telefy/actions/workflows/deploy.yml)
[![formatter.yml](https://github.com/winstxnhdw/telefy/actions/workflows/formatter.yml/badge.svg)](https://github.com/winstxnhdw/telefy/actions/workflows/formatter.yml)

`telefy` is a Cloudflare Worker that submits generic notifications to the Telegram API.

## Usage

`POST` **`/`** `(send notification)`

### Request Headers

> | name          |  type    | description                       |
> | ------------- | -------- | --------------------------------- |
> | Authorization | required | `AUTH_TOKEN` environment variable |

### Parameters

#### NotificationSchema

> | name        |  type    | data type      | description                   |
> | ----------- | -------- | ---------------| ----------------------------- |
> | subject     | required | `string`       | notification subject          |
> | body        | required | `string`       | notification body             |
> | attachments | optional | `File[]`       | array of files to attach      |

### Responses

> | http code | content-type | reason                          |
> | --------- | ------------ | ------------------------------- |
> | `200`     | `text/plain` | notification sent successfully  |
> | `400`     | `text/plain` | invalid request body            |
> | `401`     | `text/plain` | invalid authentication token    |

### Example cURL

> ```bash
> curl $TELEFY_ENDPOINT
>   -H "Authorization: Bearer $AUTH_TOKEN" \
>   -F "subject=Title" \
>   -F "body=This is the body of the notification." \
>   -F "attachments=@/path/to/file1" \
>   -F "attachments=@/path/to/file2"
> ```

### Example AIOHTTP

> ```python
> async with ClientSession(headers={'Authorization': f'Bearer {env["AUTH_TOKEN"]}'}) as session:
>     form_data = FormData()
>     form_data.add_field('subject', 'Hello World')
>     form_data.add_field('body', 'This is the body of the notification.')
>     form_data.add_field('attachments', image, filename='image.jpg', content_type='image/jpeg')
>
>     async with session.post(env['TELEFY_ENDPOINT'], data=form_data) as response:
>         response.raise_for_status()
> ```

### Example HTTPX

> ```python
> async with AsyncClient() as client:
>     await client.post(env['TELEFY_ENDPOINT'],
>         headers={"Authorization": f"Bearer {env['AUTH_TOKEN']}"},
>         data={"subject": "Hello World", "body": "This is the body of the notification."},
>         files=[("attachments", ("image.jpg", image, "image/jpeg"))],
>     )
> ```

## Setup

Populate the following environment variables in your Cloudflare Worker

```bash
{
  echo "AUTH_TOKEN=$AUTH_TOKEN"
  echo "TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN"
  echo "TELEGRAM_CHAT_ID=$TELEGRAM_CHAT_ID"
} >> .env
```

## Development

Install all dependencies.

```bash
bun install
```

Run the development server.

```bash
bun dev
```
