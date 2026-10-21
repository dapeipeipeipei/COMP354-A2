import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyCart, addItem, setQuantity, removeItem, cartTotal,
  itemCount, pickupSlots, toOrderRequest,
} from '../public/js/cart.js';

const bistro = { id: 1, name: 'Maple Bistro' };
const ramen = { id: 2, name: 'Sakura Ramen' };
const poutine = { id: 101, name: 'Classic Poutine', price: 9.5 };
const tea = { id: 103, name: 'Maple Iced Tea', price: 3.25 };
const gyoza = { id: 203, name: 'Gyoza (6 pcs)', price: 7.5 };

test('adding the same item twice increases its quantity', () => {
  let cart = addItem(emptyCart(), bistro, poutine);
  cart = addItem(cart, bistro, poutine);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 2);
  assert.equal(cart.restaurantId, 1);
});

test('adding an item from another restaurant starts a new cart', () => {
  let cart = addItem(emptyCart(), bistro, poutine);
  cart = addItem(cart, ramen, gyoza);
  assert.equal(cart.restaurantId, 2);
  assert.deepEqual(cart.items.map((i) => i.itemId), [203]);
});

test('total and item count follow quantities', () => {
  let cart = addItem(emptyCart(), bistro, poutine);
  cart = addItem(cart, bistro, tea);
  cart = setQuantity(cart, 101, 3);
  assert.equal(cartTotal(cart), 9.5 * 3 + 3.25);
  assert.equal(itemCount(cart), 4);
});

test('quantity 0 removes the item, and removing the last item empties the cart', () => {
  let cart = addItem(emptyCart(), bistro, poutine);
  cart = addItem(cart, bistro, tea);
  cart = setQuantity(cart, 101, 0);
  assert.deepEqual(cart.items.map((i) => i.itemId), [103]);
  cart = removeItem(cart, 103);
  assert.deepEqual(cart, emptyCart());
});

test('quantity is capped at 20', () => {
  const cart = setQuantity(addItem(emptyCart(), bistro, poutine), 101, 50);
  assert.equal(cart.items[0].quantity, 20);
});

test('cart functions do not modify the original cart', () => {
  const cart = addItem(emptyCart(), bistro, poutine);
  setQuantity(cart, 101, 5);
  assert.equal(cart.items[0].quantity, 1);
});

test('pickup slots are 15 minutes apart and at least 15 minutes away', () => {
  const now = new Date('2026-10-20T12:07:00Z');
  const slots = pickupSlots(now, 4);
  assert.deepEqual(slots.map((s) => s.toISOString()), [
    '2026-10-20T12:30:00.000Z',
    '2026-10-20T12:45:00.000Z',
    '2026-10-20T13:00:00.000Z',
    '2026-10-20T13:15:00.000Z',
  ]);
  for (const slot of slots) {
    assert.ok(slot - now >= 15 * 60 * 1000);
  }
});

test('toOrderRequest sends only item ids and quantities', () => {
  const cart = addItem(emptyCart(), bistro, poutine);
  const body = toOrderRequest(cart, 'Alex', '2026-10-20T12:30:00.000Z');
  assert.deepEqual(body, {
    restaurantId: 1,
    customerName: 'Alex',
    pickupTime: '2026-10-20T12:30:00.000Z',
    items: [{ itemId: 101, quantity: 1 }],
  });
});
