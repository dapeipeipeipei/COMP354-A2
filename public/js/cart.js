// Shopping cart logic.
// The cart functions are "pure": they take a cart and return a new cart,
// which makes them easy to test. loadCart/saveCart keep it in localStorage.
//
// Cart shape: { restaurantId, restaurantName, items: [{ itemId, name, price, quantity }] }

const STORAGE_KEY = 'quickbite-cart';
export const MAX_QUANTITY = 20;

export function emptyCart() {
  return { restaurantId: null, restaurantName: '', items: [] };
}

// A cart only holds items from one restaurant.
// Adding an item from a different restaurant starts a new cart.
export function addItem(cart, restaurant, menuItem) {
  const base = cart.restaurantId === restaurant.id ? cart : emptyCart();
  const existing = base.items.find((i) => i.itemId === menuItem.id);

  const items = existing
    ? base.items.map((i) =>
        i.itemId === menuItem.id ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) } : i)
    : [...base.items, { itemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }];

  return { restaurantId: restaurant.id, restaurantName: restaurant.name, items };
}

// Quantity 0 or less removes the item.
export function setQuantity(cart, itemId, quantity) {
  if (quantity <= 0) return removeItem(cart, itemId);
  const q = Math.min(quantity, MAX_QUANTITY);
  return { ...cart, items: cart.items.map((i) => (i.itemId === itemId ? { ...i, quantity: q } : i)) };
}

export function removeItem(cart, itemId) {
  const items = cart.items.filter((i) => i.itemId !== itemId);
  return items.length === 0 ? emptyCart() : { ...cart, items };
}

export function cartTotal(cart) {
  const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return Math.round(total * 100) / 100;
}

export function itemCount(cart) {
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

// Pickup choices: every 15 minutes, starting at least 15 minutes from now.
// The server checks the chosen time again when the order is placed.
export function pickupSlots(now = new Date(), count = 8) {
  const step = 15 * 60 * 1000;
  const first = Math.ceil((now.getTime() + step) / step) * step;
  const slots = [];
  for (let i = 0; i < count; i++) {
    slots.push(new Date(first + i * step));
  }
  return slots;
}

// Converts the cart into the request body for POST /api/orders.
export function toOrderRequest(cart, customerName, pickupTime) {
  return {
    restaurantId: cart.restaurantId,
    customerName,
    pickupTime,
    items: cart.items.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
  };
}

export function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || emptyCart();
  } catch {
    return emptyCart();
  }
}

export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(STORAGE_KEY);
}
