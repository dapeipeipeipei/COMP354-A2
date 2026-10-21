import { api, money, formatTime, escapeHtml } from './api.js';

const STATUSES = ['Received', 'Preparing', 'Ready for Pickup', 'Completed'];
const REFRESH_MS = 5000;

const orderId = new URLSearchParams(location.search).get('id');
const errorBox = document.getElementById('error');
let timer = null;

function render(order) {
  document.getElementById('order').classList.remove('hidden');
  document.getElementById('title').textContent = `Order #${order.id}`;
  document.getElementById('restaurant').textContent = order.restaurantName;
  document.getElementById('pickup').textContent = formatTime(order.pickupTime);
  document.getElementById('total').textContent = money(order.total);

  // Steps before the current status are "done", the current one is highlighted.
  const current = STATUSES.indexOf(order.status);
  document.getElementById('steps').innerHTML = STATUSES.map((s, i) => {
    const cls = i < current ? 'done' : i === current ? 'current' : '';
    return `<span class="${cls}">${s}</span>`;
  }).join('');

  document.getElementById('items').innerHTML = order.items.map((i) => `
    <tr><td>${i.quantity} x ${escapeHtml(i.name)}</td><td>${money(i.price * i.quantity)}</td></tr>
  `).join('');
}

async function refresh() {
  try {
    const order = await api(`/orders/${orderId}`);
    errorBox.classList.add('hidden');
    render(order);
    if (order.status === 'Completed') clearInterval(timer);
  } catch (err) {
    errorBox.textContent = 'Could not load order: ' + err.message;
    errorBox.classList.remove('hidden');
  }
}

refresh();
timer = setInterval(refresh, REFRESH_MS);
