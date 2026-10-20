import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, request } from './helpers.js';

let server;
before(async () => { server = await startServer(); });
after(() => server.close());

test('unknown API routes return a JSON 404', async () => {
  const res = await request(server.base, '/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not found');
});
