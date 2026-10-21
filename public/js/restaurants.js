import { api, escapeHtml } from './api.js';

const list = document.getElementById('restaurant-list');
const errorBox = document.getElementById('error');

async function showRestaurants() {
  try {
    const restaurants = await api('/restaurants');
    list.innerHTML = restaurants.map((r) => `
      <a class="card" href="menu.html?id=${r.id}">
        <h2>${escapeHtml(r.name)}</h2>
        <div class="muted">${escapeHtml(r.cuisine)} &middot; ${escapeHtml(r.address)}</div>
      </a>
    `).join('');
  } catch (err) {
    errorBox.textContent = 'Could not load restaurants: ' + err.message;
    errorBox.classList.remove('hidden');
  }
}

showRestaurants();
