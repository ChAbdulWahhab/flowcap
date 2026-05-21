# @chabdulwahab/flowcap

<div>

[![NPM Version](https://img.shields.io/npm/v/@chabdulwahab/flowcap.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/@chabdulwahab/flowcap)
[![NPM Downloads](https://img.shields.io/npm/dt/@chabdulwahab/flowcap.svg?style=flat-square)](https://www.npmjs.com/package/@chabdulwahab/flowcap)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square)](https://www.npmjs.com/package/@chabdulwahab/flowcap)
[![Types: Included](https://img.shields.io/badge/types-included-blue.svg?style=flat-square)](#)
[![Node.js Support](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

A zero-dependency, framework-agnostic HTTP rate limiting middleware for Node.js.

## Features

- **Framework Agnostic:** Seamlessly integrates with Express, Fastify, Koa, and vanilla Node.js HTTP modules.
- **Zero Dependencies:** No external runtime dependencies, minimizing security risks and bundle sizes.
- **Human-Readable Windows:** Configure durations using intuitive strings like `'15m'`, `'30s'`, or `'1h'`.
- **High Performance:** Implements an in-memory sliding window algorithm with O(1) automatic pruning.
- **Built-in Presets:** Includes pre-configured rule sets (login, api, strict, loose) for common scenarios.
- **Standards Compliant:** Follows the IETF draft-8 standard for RateLimit headers.
- **First-Class TypeScript Support:** Out-of-the-box type declarations included.

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

// Apply a global rate limit of 100 requests per minute
app.use(flowcap({ limit: 100, window: '1m' }));
```

### Built-in Presets

Presets provide default configurations for common use cases. These settings can be overridden.

```javascript
// Protect login route (5 req / 15m)
app.post('/login', flowcap.login());

// Standard API limit (100 req / 1m)
app.use('/api', flowcap.api());

// Strict limit for administrative routes (20 req / 1m)
app.post('/admin', flowcap.strict());

// Loose limit for public assets (500 req / 1m)
app.get('/public', flowcap.loose());

// Override a preset configuration
app.post('/login', flowcap.login({ limit: 3 }));
```

---

## Framework Support

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

---

## API Reference

### Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `limit` | `number` | `100` | Maximum requests permitted per window. |
| `window` | `string` \| `number` | `'1m'` | Window duration. Accepts readable strings (e.g., `'15m'`, `'30s'`) or milliseconds. |
| `keyBy` | `function` | `req => req.ip` | Extracts the unique identifier for the client making the request. |
| `skip` | `function` | `null` | Returns `true` to unconditionally bypass rate limiting. |
| `onLimit` | `function` | `null` | Custom handler for HTTP 429 Responses: `(req, res, next)`. |
| `legacyHeaders` | `boolean` | `true` | Appends traditional `X-RateLimit-*` headers alongside IETF draft-8 standards. |
| `store` | `Store` | `Memory` | Instance of a custom state store. |

### Advanced Configurations

#### Custom Client Identification

```javascript
app.use(flowcap({
  limit: 200,
  window: '1h',
  keyBy: (req) => req.headers['x-api-key'] || req.ip
}));
```

#### Conditional Bypassing

```javascript
app.use(flowcap({
  limit: 100,
  window: '1m',
  skip: (req) => req.path === '/health'
}));
```

#### Custom Rate Limit Responses

```javascript
app.use(flowcap({
  limit: 50,
  window: '30s',
  onLimit: (req, res, next) => {
    res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
  }
}));
```

### Custom Store Implementation

For distributed environments (e.g., Redis), implement the `FlowcapStore` interface and pass the instance to `options.store`.

```typescript
interface FlowcapStore {
  count(key: string, windowMs: number): number;
  add(key: string, windowMs: number): void;
  resetTime(key: string, windowMs: number): number;
}
```

---

## Resources

[![Flowcap Article Banner](./assets/article-banner.webp)](https://dev.to/chabdulwahhab310/why-i-stopped-writing-15-60-1000-in-every-project-4gb)

- **Deep Dive / Article:** Read the detailed article on [dev.to](https://dev.to/chabdulwahhab310/why-i-stopped-writing-15-60-1000-in-every-project-4gb) explaining the design decisions and implementation details.

## License

MIT
