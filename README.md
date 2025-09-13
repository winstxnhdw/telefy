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

### Responses

> | http code | content-type | reason                          |
> | --------- | ------------ | ------------------------------- |
> | `200`     | `text/plain` | notification sent successfully  |
> | `400`     | `text/plain` | invalid request body            |
> | `401`     | `text/plain` | invalid authentication token    |

### Example cURL

> ```bash
> curl $TELEFY_ENDPOINT -H "Content-Type: application/json" -H "Authorization: Bearer $AUTH_TOKEN" -d \
> '{
>    "subject": "Hello World",
>    "body": "This is the body of the notification."
>  }'
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
