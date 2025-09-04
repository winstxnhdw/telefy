# telefy

[![main.yml](https://github.com/winstxnhdw/telefy/actions/workflows/main.yml/badge.svg)](https://github.com/winstxnhdw/telefy/actions/workflows/main.yml)
[![deploy.yml](https://github.com/winstxnhdw/telefy/actions/workflows/deploy.yml/badge.svg)](https://github.com/winstxnhdw/telefy/actions/workflows/deploy.yml)
[![formatter.yml](https://github.com/winstxnhdw/telefy/actions/workflows/formatter.yml/badge.svg)](https://github.com/winstxnhdw/telefy/actions/workflows/formatter.yml)

`telefy` is a Cloudflare Worker that submits generic notifications to the Telegram API.

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
