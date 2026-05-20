const { test } = require('node:test');
const assert = require('node:assert');
const { Store } = require('../src/store');

test('Store: count() returns 0 for unseen key', () => {
  const store = new Store();
  assert.strictEqual(store.count('unknown', 1000), 0);
});

test('Store: add() increments count', () => {
  const store = new Store();
  store.add('user1', 1000);
  assert.strictEqual(store.count('user1', 1000), 1);
  store.add('user1', 1000);
  assert.strictEqual(store.count('user1', 1000), 2);
});

test('Store: count() ignores timestamps outside window', async () => {
  const store = new Store();
  store.add('user1', 50); // Will expire in 50ms
  assert.strictEqual(store.count('user1', 50), 1);
  
  await new Promise(resolve => setTimeout(resolve, 60));
  assert.strictEqual(store.count('user1', 50), 0);
});

test('Store: add() auto-prunes expired timestamps', async () => {
  const store = new Store();
  store.add('user1', 50);
  await new Promise(resolve => setTimeout(resolve, 60));
  store.add('user1', 50);
  
  const timestamps = store.hits.get('user1');
  assert.strictEqual(timestamps.length, 1);
});

test('Store: resetTime() returns correct expiry timestamp', () => {
  const store = new Store();
  const now = Date.now();
  store.add('user1', 1000);
  const reset = store.resetTime('user1', 1000);
  assert.ok(reset >= now + 990 && reset <= now + 1010);
});
