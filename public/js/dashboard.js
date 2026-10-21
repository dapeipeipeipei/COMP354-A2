import { api, money, formatTime, escapeHtml } from './api.js';

const NEXT_STATUS = {
  'Received': 'Preparing',
  'Preparing': 'Ready for Pickup',
  'Ready for Pickup': 'Completed',
};
const REFRESH_MS = 5000;

const select = document.getElementById('restaurant');
const showCompleted = document.getElementById('show-completed');
const ordersBox = document.getElementById('orders');
const errorBox = document.getElementById('error');

function showError(text) {
  errorBox.textContent = text;
  errorBox.classList.toggle('hidden', !text);
}

function orderCard(order) {
  const next = NEXT_STATUS[order.status];
  const items = order.items.map((i) => `${i.quantity} x ${escapeHtml(i.name)}`).join(', ');
  return `
    <div class="card">
      <div class="row">
        <h2>#${order.id} &middot; ${escapeHtml(order.customerName)}</h2>
        <span class="badge">${order.status}</span>
      </div>
      <div class="muted">Pickup at ${formatTime(order.pickupTime)} &middot; ${money(order.total)}</div>
      <p>${items}</p>
      ${next ? `<button data-id="${order.id}" data-next="${next}">Mark as ${next}</button>` : ''}
    </div>
  `;
}

async function loadOrders() {
  try {
    let orders = await api(`/restaurants/${select.value}/orders`);
    if (!showCompleted.checked) {
      orders = orders.filter((o) => o.status !== 'Completed');
    }
    ordersBox.innerHTML = orders.length
      ? orders.map(orderCard).join('')
      : '<p class="muted">No orders right now.</p>';
    showError('');
  } catch (err) {
    showError('Could not load orders: ' + err.message);
  }
}

// "Mark as ..." buttons
ordersBox.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  btn.disabled = true;
  try {
    await api(`/orders/${btn.dataset.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: btn.dataset.next }),
    });
  } catch (err) {
    showError('Could not update order: ' + err.message);
  }
  loadOrders();
});

async function start() {
  const restaurants = await api('/restaurants');
  select.innerHTML = restaurants
    .map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`)
    .join('');
  select.addEventListener('change', loadOrders);
  showCompleted.addEventListener('change', loadOrders);
  loadOrders();
  setInterval(loadOrders, REFRESH_MS);
}

start().catch((err) => showError('Could not load restaurants: ' + err.message));
