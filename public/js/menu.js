import { api, money, escapeHtml } from './api.js';
import { loadCart, saveCart, addItem, itemCount } from './cart.js';

const restaurantId = new URLSearchParams(location.search).get('id');
const itemsBox = document.getElementById('menu-items');
const messageBox = document.getElementById('message');
const cartCount = document.getElementById('cart-count');

let restaurant = null;
let items = [];

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = 'message ' + type;
}

function updateCartCount() {
  cartCount.textContent = itemCount(loadCart());
}

function addToCart(itemId) {
  const item = items.find((i) => i.id === itemId);
  const cart = loadCart();
  const switchedRestaurant = cart.items.length > 0 && cart.restaurantId !== restaurant.id;

  saveCart(addItem(cart, restaurant, item));
  updateCartCount();

  if (switchedRestaurant) {
    showMessage(`Your cart had items from another restaurant, so it was cleared. Added ${item.name}.`, 'info');
  } else {
    showMessage(`Added ${item.name} to your cart.`, 'info');
  }
}

async function showMenu() {
  try {
    const data = await api(`/restaurants/${restaurantId}/menu`);
    restaurant = data.restaurant;
    items = data.items;

    document.getElementById('restaurant-name').textContent = restaurant.name;
    document.getElementById('restaurant-info').textContent = `${restaurant.cuisine} · ${restaurant.address}`;

    itemsBox.innerHTML = items.map((item) => `
      <div class="card row">
        <div>
          <h2>${escapeHtml(item.name)}</h2>
          <div class="muted">${escapeHtml(item.description)}</div>
        </div>
        <div class="row">
          <strong>${money(item.price)}</strong>
          <button data-id="${item.id}">Add</button>
        </div>
      </div>
    `).join('');

    itemsBox.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => addToCart(Number(btn.dataset.id)));
    });
  } catch (err) {
    showMessage('Could not load menu: ' + err.message, 'error');
  }
}

updateCartCount();
showMenu();
