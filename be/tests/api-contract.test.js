const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { parsePagination } = require('../src/utils/pagination');

async function withServer(run) {
  const server = createApp().listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('health endpoint preserves the frontend contract', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'OK');
    assert.equal(typeof body.timestamp, 'string');
    assert.equal(body.version, '2.0.0');
  });
});

test('unknown endpoints use the shared JSON error contract', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/does-not-exist`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.equal(body.error, 'Route not found');
  });
});

test('likes endpoints reject malformed writes before database access', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/item-likes/toggle`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 0, itemType: 'invalid' })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
  });
});

test('pagination input is bounded and deterministic', () => {
  assert.deepEqual(parsePagination('-1', '500'), { page: 1, limit: 100, offset: 0 });
  assert.deepEqual(parsePagination('3', '20'), { page: 3, limit: 20, offset: 40 });
  assert.deepEqual(parsePagination('bad', 'bad'), { page: 1, limit: 12, offset: 0 });
});
