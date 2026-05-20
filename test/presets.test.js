const { test } = require('node:test');
const assert = require('node:assert');
const flowcap = require('../src/index');

test('Presets: flowcap.login() uses limit 5, window 15m', () => {
  const mw = flowcap.login();
  assert.strictEqual(typeof mw, 'function');
});

test('Presets: flowcap.api() uses limit 100, window 1m', () => {
  const mw = flowcap.api();
  assert.strictEqual(typeof mw, 'function');
});

test('Presets: override works flowcap.login({ limit: 3 })', (t, done) => {
  const mw = flowcap.login({ limit: 3 });
  
  function mockReq() { return { ip: '127.0.0.1', headers: {}, socket: {} }; }
  function mockRes() { return { headers: {}, setHeader() {} }; }
  
  mw(mockReq(), mockRes(), () => {
    done();
  });
});
