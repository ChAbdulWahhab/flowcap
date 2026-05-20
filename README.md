# @chabdulwahab/flowcap

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@chabdulwahab/flowcap.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/@chabdulwahab/flowcap)
[![NPM Downloads](https://img.shields.io/npm/dt/@chabdulwahab/flowcap.svg?style=flat-square)](https://www.npmjs.com/package/@chabdulwahab/flowcap)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square)](https://www.npmjs.com/package/@chabdulwahab/flowcap)
[![Types: Included](https://img.shields.io/badge/types-included-blue.svg?style=flat-square)](#)
[![Node.js Support](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Zero-dependency, framework-agnostic HTTP rate limiting middleware for Node.js.**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [API Reference](#api-reference)

</div>

---

## Features

- 🚀 **Framework Agnostic:** Seamlessly integrates with Express, Fastify, Koa, and vanilla `http`.
- 🪶 **Zero Dependencies:** Keeps your `node_modules` lightweight and minimizes security risks.
- 🕒 **Human-Readable Windows:** Configure windows using intuitive strings (`'15m'`, `'30s'`, `'1h'`) instead of raw milliseconds.
- ⚡ **High Performance:** Powered by an optimized in-memory sliding window algorithm with O(1) auto-pruning.
- 🛠️ **Built-in Presets:** Ships with production-ready configurations (`login`, `api`, `strict`, `loose`) for immediate use.
- 📜 **Standards Compliant:** Automatically implements IETF draft-8 standard `RateLimit` headers.
- 🔒 **TypeScript Ready:** Comprehensive type definitions included out-of-the-box.

## Installation

```bash
npm install @chabdulwahab/flowcap
```

## Usage

### Quick Start (Express)

```javascript
const express = require('express');
const flowcap = require('@chabdulwahab/flowcap');

const app = express();

// Apply a global rate limit of 100 requests per minute
app.use(flowcap({ limit: 100, window: '1m' }));
```

### Built-in Presets

Leverage pre-configured defaults designed for standard industry use cases. Options can be easily overridden.

```javascript
// Protect against brute-force attacks (5 req / 15m)
app.post('/login', flowcap.login());

// Standard API limit (100 req / 1m)
app.use('/api', flowcap.api());

// Heavily restricted endpoints (20 req / 1m)
app.post('/admin', flowcap.strict());

// High-traffic public endpoints (500 req / 1m)
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

Provide these options to the `flowcap` middleware initializer.

| Option | Type | Default | Description |
|---|---|---|---|
| `limit` | `number` | `100` | Maximum requests permitted per window. |
| `window` | `string` \| `number` | `'1m'` | Window duration. Accepts readable strings (e.g., `'15m'`, `'30s'`) or milliseconds. |
| `keyBy` | `function` | `req => req.ip` | Extracts the unique identifier for the client making the request. |
| `skip` | `function` | `null` | Returns `true` to unconditionally bypass rate limiting. |
| `onLimit` | `function` | `null` | Custom handler for HTTP 429 Responses: `(req, res, next)`. |
| `legacyHeaders` | `boolean` | `true` | Appends traditional `X-RateLimit-*` headers alongside IETF draft-8 standards. |
| `store` | `Store` | `Memory` | Instance of a custom state store. |

### Advanced Usage

#### Custom Client Identification
Rate limit by authenticated user IDs, API keys, or custom headers:

```javascript
app.use(flowcap({
  limit: 200,
  window: '1h',
  keyBy: (req) => req.headers['x-api-key'] || req.ip
}));
```

#### Conditional Bypassing
Exclude specific routes such as internal health checks:

```javascript
app.use(flowcap({
  limit: 100,
  window: '1m',
  skip: (req) => req.path === '/health'
}));
```

#### Custom Rate Limit Responses
Intercept and handle HTTP 429 gracefully:

```javascript
app.use(flowcap({
  limit: 50,
  window: '30s',
  onLimit: (req, res, next) => {
    res.status(429).json({ error: 'You have exceeded the rate limit. Please try again later.' });
  }
}));
```

### Custom Store Implementation

For distributed environments or persistence (e.g., Redis, Memcached), implement the `FlowcapStore` interface and pass the instance to `options.store`.

```typescript
interface FlowcapStore {
  count(key: string, windowMs: number): number;
  add(key: string, windowMs: number): void;
  resetTime(key: string, windowMs: number): number;
}
```

## License
MIT
