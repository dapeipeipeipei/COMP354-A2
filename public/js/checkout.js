import { api, money, formatTime, escapeHtml } from './api.js';
import {
  loadCart, saveCart, clearCart, setQuantity, removeItem,
  cartTotal, pickupSlots, toOrderRequest,
} from './cart.js';

const emptyBox = document.getElementById('empty');
const cartBox = document.getElementById('cart');
const form = document.getElementById('checkout');
const errorBox = document.getElementById('error');
const placeButton = document.getElementById('place-order');

let cart = loadCart();

function render() {
  const isEmpty = cart.items.length === 0;
  emptyBox.classList.toggle('hidden', !isEmpty);
  cartBox.classList.toggle('hidden', isEmpty);
  form.classList.toggle('hidden', isEmpty);
  if (isEmpty) return;

  document.getElementById('cart-restaurant').textContent = cart.restaurantName;
  document.getElementById('cart-total').textContent = money(cartTotal(cart));

  document.getElementById('cart-items').innerHTML = cart.items.map((i) => `
    <tr>
      <td>${escapeHtml(i.name)}</td>
      <td>${money(i.price)}</td>
      <td>
        <button type="button" class="secondary" data-action="minus" data-id="${i.itemId}">-</button>
        ${i.quantity}
        <button type="button" class="secondary" data-action="plus" data-id="${i.itemId}">+</button>
      </td>
      <td>${money(i.price * i.quantity)}</td>
      <td><button type="button" class="secondary" data-action="remove" data-id="${i.itemId}">Remove</button></td>
    </tr>
  `).join('');
}

function renderPickupSlots() {
  document.getElementById('pickup-time').innerHTML = pickupSlots()
    .map((slot) => `<option value="${slot.toISOString()}">${formatTime(slot)}</option>`)
    .join('');
}

function showError(text) {
  errorBox.textContent = text;
  errorBox.classList.toggle('hidden', !text);
}

// +, - and Remove buttons in the cart table
document.getElementById('cart-items').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const itemId = Number(btn.dataset.id);
  const item = cart.items.find((i) => i.itemId === itemId);

  if (btn.dataset.action === 'plus') cart = setQuantity(cart, itemId, item.quantity + 1);
  if (btn.dataset.action === 'minus') cart = setQuantity(cart, itemId, item.quantity - 1);
  if (btn.dataset.action === 'remove') cart = removeItem(cart, itemId);

  saveCart(cart);
  render();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');

  const name = document.getElementById('customer-name').value.trim();
  const pickupTime = document.getElementById('pickup-time').value;
  if (!name) return showError('Please enter your name.');

  placeButton.disabled = true;
  try {
    const order = await api('/orders', {
      method: 'POST',
      body: JSON.stringify(toOrderRequest(cart, name, pickupTime)),
    });
    clearCart();
    location.href = `order.html?id=${order.id}`;
  } catch (err) {
    // Keep the cart so the customer can fix the problem and try again.
    showError('Order not placed: ' + err.message);
    renderPickupSlots();
    placeButton.disabled = false;
  }
});

render();
renderPickupSlots();
