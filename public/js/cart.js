// Placeholder: the cart is implemented by Jinghao.
export function emptyCart() {
  return { restaurantId: null, restaurantName: '', items: [] };
}
export function loadCart() { return emptyCart(); }
export function saveCart(cart) {}
export function addItem(cart, restaurant, menuItem) { return cart; }
export function itemCount(cart) { return 0; }
