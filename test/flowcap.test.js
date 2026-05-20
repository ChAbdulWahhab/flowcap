const { test } = require('node:test');
const assert = require('node:assert');
const flowcap = require('../src/index');
const defaultStore = require('../src/store');

function mockReq(ip = '127.0.0.1', path = '/') {
  return { ip, path, headers: {}, socket: { remoteAddress: ip } };
}

function mockRes() {
  const headers = {};
  return {
    headers,
    statusCode: null,
    body: null,
    setHeader(k, v) { headers[k.toLowerCase()] = v; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; },
    end(str) { this.body = JSON.parse(str); }
  };
}

test('flowcap: first request passes through, next() called', (t, done) => {
  defaultStore.clear();
  const mw = flowcap({ limit: 2, window: '1m' });
  const req = mockReq();
  const res = mockRes();
  
  mw(req, res, () => {
    assert.strictEqual(res.headers['ratelimit'].includes('limit=2'), true);
    assert.strictEqual(res.headers['ratelimit'].includes('remaining=1'), true);
    done();
  });
});

test('flowcap: Correct RateLimit and X-RateLimit-* headers set', (t, done) => {
  defaultStore.clear();
  const mw = flowcap({ limit: 5, window: '1m' });
  const req = mockReq();
  const res = mockRes();
  
  mw(req, res, () => {
    assert.ok(res.headers['ratelimit']);
    assert.strictEqual(res.headers['x-ratelimit-limit'], 5);
    assert.strictEqual(res.headers['x-ratelimit-remaining'], 4);
    assert.ok(res.headers['x-ratelimit-reset']);
    done();
  });
});

test('flowcap: Request at exactly limit -> blocked with 429', () => {
  defaultStore.clear();
  const mw = flowcap({ limit: 1, window: '1m' });
  const req = mockReq();
  const res = mockRes();
  
  mw(req, res, () => {}); // 1st passes
  
  const res2 = mockRes();
  mw(req, res2, () => { assert.fail('Should not be called'); }); // 2nd blocked
  
  assert.strictEqual(res2.statusCode, 429);
  assert.strictEqual(res2.body.error, 'Too Many Requests');
  assert.ok(res2.headers['retry-after'] !== undefined);
});

test('flowcap: skip() function bypasses limiting', (t, done) => {
  defaultStore.clear();
  const mw = flowcap({
    limit: 1, 
    window: '1m',
    skip: (req) => req.path === '/health'
  });
  
  const req = mockReq('127.0.0.1', '/health');
  const res = mockRes();
  
  mw(req, res, () => {}); // 1st passes
  mw(req, mockRes(), () => { done(); }); // 2nd also passes!
});

test('flowcap: onLimit() custom handler called on 429', (t, done) => {
  defaultStore.clear();
  const mw = flowcap({
    limit: 1, 
    window: '1m',
    onLimit: (req, res, next) => {
      res.statusCode = 418;
      done();
    }
  });
  
  const req = mockReq();
  mw(req, mockRes(), () => {}); // 1st passes
  
  const res2 = mockRes();
  mw(req, res2, () => {}); // 2nd blocked, triggers onLimit
  assert.strictEqual(res2.statusCode, 418);
});

test('flowcap: keyBy custom function used as key', () => {
  defaultStore.clear();
  const mw = flowcap({
    limit: 1,
    window: '1m',
    keyBy: (req) => req.headers['x-user-id']
  });
  
  const req1 = mockReq(); req1.headers['x-user-id'] = 'user1';
  const req2 = mockReq(); req2.headers['x-user-id'] = 'user2';
  
  mw(req1, mockRes(), () => {}); // passes
  mw(req2, mockRes(), () => {}); // also passes, different key
});

test('flowcap: legacyHeaders: false disables X-RateLimit-* headers', (t, done) => {
  defaultStore.clear();
  const mw = flowcap({ limit: 5, window: '1m', legacyHeaders: false });
  const req = mockReq();
  const res = mockRes();
  
  mw(req, res, () => {
    assert.ok(res.headers['ratelimit']);
    assert.strictEqual(res.headers['x-ratelimit-limit'], undefined);
    done();
  });
});

test('flowcap: Different IPs tracked independently', () => {
  defaultStore.clear();
  const mw = flowcap({ limit: 1, window: '1m' });
  
  const req1 = mockReq('10.0.0.1');
  const req2 = mockReq('10.0.0.2');
  
  mw(req1, mockRes(), () => {}); // 10.0.0.1 passes
  mw(req2, mockRes(), () => {}); // 10.0.0.2 passes
  
  const res1Blocked = mockRes();
  mw(req1, res1Blocked, () => {});
  assert.strictEqual(res1Blocked.statusCode, 429); // 10.0.0.1 blocked
});
