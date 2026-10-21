import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, request, validPickupTime } from './helpers.js';
import { nextStatus, canChangeStatus } from '../server/status.js';

let server;
before(async () => { server = await startServer(); });
after(() => server.close());

async function placeOrder(restaurantId = 2, itemId = 201) {
  const res = await request(server.base, '/orders', 'POST', {
    restaurantId,
    customerName: 'Sam',
    pickupTime: validPickupTime(),
    items: [{ itemId, quantity: 1 }],
  });
  return res.body;
}

function setStatus(id, status) {
  return request(server.base, `/orders/${id}/status`, 'PATCH', { status });
}

test('statuses only move forward one step', () => {
  assert.equal(nextStatus('Received'), 'Preparing');
  assert.equal(nextStatus('Preparing'), 'Ready for Pickup');
  assert.equal(nextStatus('Ready for Pickup'), 'Completed');
  assert.equal(nextStatus('Completed'), null);
  assert.equal(canChangeStatus('Received', 'Completed'), false);
  assert.equal(canChangeStatus('Preparing', 'Received'), false);
});

test('the dashboard lists only that restaurant\'s orders', async () => {
  const ramenOrder = await placeOrder(2, 201);
  const pastaOrder = await placeOrder(3, 301);

  const res = await request(server.base, '/restaurants/2/orders');
  assert.equal(res.status, 200);
  const ids = res.body.map((o) => o.id);
  assert.ok(ids.includes(ramenOrder.id));
  assert.ok(!ids.includes(pastaOrder.id));
});

test('dashboard returns 404 for an unknown restaurant', async () => {
  const res = await request(server.base, '/restaurants/999/orders');
  assert.equal(res.status, 404);
});

test('staff can move an order through every status and the customer sees it', async () => {
  const order = await placeOrder();
  for (const status of ['Preparing', 'Ready for Pickup', 'Completed']) {
    const res = await setStatus(order.id, status);
    assert.equal(res.status, 200);
    const customerView = await request(server.base, `/orders/${order.id}`);
    assert.equal(customerView.body.status, status);
  }
});

test('skipping a status is rejected with 409', async () => {
  const order = await placeOrder();
  const res = await setStatus(order.id, 'Completed');
  assert.equal(res.status, 409);
  const unchanged = await request(server.base, `/orders/${order.id}`);
  assert.equal(unchanged.body.status, 'Received');
});

test('going backwards is rejected with 409', async () => {
  const order = await placeOrder();
  await setStatus(order.id, 'Preparing');
  const res = await setStatus(order.id, 'Received');
  assert.equal(res.status, 409);
});

test('an unknown status is rejected with 400', async () => {
  const order = await placeOrder();
  const res = await setStatus(order.id, 'Cooking');
  assert.equal(res.status, 400);
});

test('updating an unknown order returns 404', async () => {
  const res = await setStatus(9999, 'Preparing');
  assert.equal(res.status, 404);
});
