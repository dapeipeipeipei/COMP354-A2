import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, request } from './helpers.js';

let server;
before(async () => { server = await startServer(); });
after(() => server.close());

test('GET /restaurants returns the seeded restaurants', async () => {
  const res = await request(server.base, '/restaurants');
  assert.equal(res.status, 200);
  assert.ok(res.body.length >= 3);
  for (const r of res.body) {
    assert.ok(r.id && r.name && r.cuisine && r.address);
  }
});

test('GET /restaurants/:id/menu returns only that restaurant\'s items', async () => {
  const res = await request(server.base, '/restaurants/1/menu');
  assert.equal(res.status, 200);
  assert.equal(res.body.restaurant.id, 1);
  assert.ok(res.body.items.length > 0);
  for (const item of res.body.items) {
    assert.equal(item.restaurantId, 1);
    assert.ok(item.price > 0);
  }
});

test('GET /restaurants/:id/menu returns 404 for an unknown restaurant', async () => {
  const res = await request(server.base, '/restaurants/999/menu');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Restaurant not found');
});
