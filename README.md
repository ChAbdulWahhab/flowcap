# @chabdulwahab/flowcap

[![npm version](https://img.shields.io/npm/v/@chabdulwahab/flowcap.svg?style=flat-square)](https://www.npmjs.com/package/@chabdulwahab/flowcap)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Zero-dependency, framework-agnostic HTTP rate limiting middleware for Node.js.

Designed to be simple, fast, and unopinionated. Uses an in-memory sliding window algorithm. Supports Express, Fastify, Koa, and vanilla `http`.

## Installation

```bash
npm install @chabdulwahab/flowcap
```

## Usage

### Express

```javascript
const express = require('express');
const flowcap = require('@chabdulwahab/flowcap');

const app = express();

app.use(flowcap({ limit: 100, window: '1m' }));
```

### Fastify

```javascript
const fastify = require('fastify')();
const flowcap = require('@chabdulwahab/flowcap');

fastify.use(flowcap());
```

### Koa

```javascript
const Koa = require('koa');
const flowcap = require('@chabdulwahab/flowcap');

const app = new Koa();

app.use(async (ctx, next) => {
  return new Promise((resolve) => {
    flowcap()(ctx.req, ctx.res, () => resolve(next()));
  });
});
```

### Built-in Presets

Pre-configured defaults for common scenarios.

```javascript
app.post('/login', flowcap.login());   // 5 req / 15m
app.use('/api', flowcap.api());        // 100 req / 1m
app.post('/admin', flowcap.strict());  // 20 req / 1m
app.get('/public', flowcap.loose());   // 500 req / 1m
```

Options can be overridden on presets:
```javascript
app.post('/login', flowcap.login({ limit: 3 }));
```

## API Options

| Option | Type | Default | Description |
|---|---|---|---|
| `limit` | `number` | `100` | Maximum requests allowed per window. |
| `window` | `string` \| `number` | `'1m'` | Window duration (e.g., `'15m'`, `'30s'`, or milliseconds). |
| `keyBy` | `function` | `req => req.ip` | Function to extract the client identifier. |
| `skip` | `function` | `null` | Returns `true` to bypass rate limiting. |
| `onLimit` | `function` | `null` | Custom 429 response handler `(req, res, next)`. |
| `legacyHeaders` | `boolean` | `true` | Include `X-RateLimit-*` alongside standard IETF draft-8 headers. |
| `store` | `Store` | `Memory` | Custom store implementation. |

## Advanced Configuration

### Custom Client Key
Rate limit based on a custom identifier (e.g., authenticated user ID):

```javascript
app.use(flowcap({
  limit: 200,
  window: '1h',
  keyBy: (req) => req.headers['x-user-id'] || req.ip
}));
```

### Conditional Bypassing
Skip rate limiting for specific routes (e.g., health checks):

```javascript
app.use(flowcap({
  limit: 100,
  window: '1m',
  skip: (req) => req.path === '/health'
}));
```

### Custom Rate Limit Response
Handle 429 responses manually:

```javascript
app.use(flowcap({
  limit: 50,
  window: '30s',
  onLimit: (req, res, next) => {
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
}));
```

## Custom Store Implementation

To implement an external store (e.g., Redis), provide an object conforming to `FlowcapStore`:

```typescript
interface FlowcapStore {
  count(key: string, windowMs: number): number;
  add(key: string, windowMs: number): void;
  resetTime(key: string, windowMs: number): number;
}
```

## License
MIT
