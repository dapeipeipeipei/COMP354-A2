import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startServer, request, validPickupTime } from './helpers.js';
import { validateOrder } from '../server/validation.js';
import { createStore } from '../server/store.js';

let server;
before(async () => { server = await startServer(); });
after(() => server.close());

function orderBody(changes = {}) {
  return {
    restaurantId: 1,
    customerName: 'Alex',
    pickupTime: validPickupTime(),
    items: [{ itemId: 101, quantity: 2 }, { itemId: 103, quantity: 1 }],
    ...changes,
  };
}

test('a valid order is accepted and stored', async () => {
  const res = await request(server.base, '/orders', 'POST', orderBody());
  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'Received');
  assert.equal(res.body.restaurantId, 1);
  assert.equal(res.body.total, 9.5 * 2 + 3.25); // prices come from the menu

  const fetched = await request(server.base, `/orders/${res.body.id}`);
  assert.equal(fetched.status, 200);
  assert.deepEqual(fetched.body, res.body);
});

test('the client cannot change the price', async () => {
  const items = [{ itemId: 101, quantity: 1, price: 0.01 }];
  const res = await request(server.base, '/orders', 'POST', orderBody({ items }));
  assert.equal(res.status, 201);
  assert.equal(res.body.total, 9.5);
});

const invalidCases = [
  ['empty cart', { items: [] }],
  ['quantity 0', { items: [{ itemId: 101, quantity: 0 }] }],
  ['quantity 1.5', { items: [{ itemId: 101, quantity: 1.5 }] }],
  ['quantity 21', { items: [{ itemId: 101, quantity: 21 }] }],
  ['item from another restaurant', { items: [{ itemId: 201, quantity: 1 }] }],
  ['unknown item', { items: [{ itemId: 999, quantity: 1 }] }],
  ['unknown restaurant', { restaurantId: 99 }],
  ['missing name', { customerName: '  ' }],
  ['pickup in the past', { pickupTime: new Date(Date.now() - 60000).toISOString() }],
  ['pickup too soon', { pickupTime: new Date(Date.now() + 5 * 60000).toISOString() }],
  ['pickup tomorrow', { pickupTime: new Date(Date.now() + 24 * 3600000).toISOString() }],
  ['pickup not a date', { pickupTime: 'soon' }],
];

for (const [name, changes] of invalidCases) {
  test(`rejects an order with ${name} and stores nothing`, async () => {
    const before = server.store.count();
    const res = await request(server.base, '/orders', 'POST', orderBody(changes));
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.length > 0);
    assert.equal(server.store.count(), before);
  });
}

test('rejects a body that is not valid JSON', async () => {
  const res = await fetch(server.base + '/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad json',
  });
  assert.equal(res.status, 400);
});

test('GET /orders/:id returns 404 for an unknown order', async () => {
  const res = await request(server.base, '/orders/9999');
  assert.equal(res.status, 404);
});

test('validateOrder accepts exactly the 15 minute lead time', () => {
  const now = new Date('2026-10-20T12:00:00Z');
  const body = orderBody({ pickupTime: '2026-10-20T12:15:00Z' });
  assert.deepEqual(validateOrder(body, now).errors, []);
});

test('orders saved to a file are loaded again after a restart', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'quickbite-')), 'orders.json');
  const first = createStore(file);
  const saved = first.add({ restaurantId: 1, status: 'Received' });

  const second = createStore(file);
  assert.deepEqual(second.get(saved.id), saved);
});
