// Seed data: participating restaurants and their menus.
// Prices are in CAD. Item ids are unique across all restaurants.

export const restaurants = [
  { id: 1, name: 'Maple Bistro', cuisine: 'Canadian', address: '1455 De Maisonneuve Blvd W' },
  { id: 2, name: 'Sakura Ramen', cuisine: 'Japanese', address: '2100 Rue Guy' },
  { id: 3, name: 'Nonna Pasta', cuisine: 'Italian', address: '6800 Boul. Saint-Laurent' },
];

export const menuItems = [
  { id: 101, restaurantId: 1, name: 'Classic Poutine', price: 9.5, description: 'Fries, cheese curds and gravy' },
  { id: 102, restaurantId: 1, name: 'Smoked Meat Sandwich', price: 13.75, description: 'On rye with mustard' },
  { id: 103, restaurantId: 1, name: 'Maple Iced Tea', price: 3.25, description: 'House-made' },

  { id: 201, restaurantId: 2, name: 'Tonkotsu Ramen', price: 15.0, description: 'Pork broth, chashu, egg' },
  { id: 202, restaurantId: 2, name: 'Veggie Miso Ramen', price: 14.0, description: 'Miso broth, tofu, corn' },
  { id: 203, restaurantId: 2, name: 'Gyoza (6 pcs)', price: 7.5, description: 'Pan-fried dumplings' },

  { id: 301, restaurantId: 3, name: 'Spaghetti Bolognese', price: 16.5, description: 'Slow-cooked beef sauce' },
  { id: 302, restaurantId: 3, name: 'Margherita Pizza', price: 14.25, description: 'Tomato, mozzarella, basil' },
  { id: 303, restaurantId: 3, name: 'Tiramisu', price: 6.75, description: 'Classic coffee dessert' },
];

export function findRestaurant(id) {
  return restaurants.find((r) => r.id === id) || null;
}

export function menuFor(restaurantId) {
  return menuItems.filter((item) => item.restaurantId === restaurantId);
}

export function findMenuItem(id) {
  return menuItems.find((item) => item.id === id) || null;
}
