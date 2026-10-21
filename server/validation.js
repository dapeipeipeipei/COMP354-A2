import { findRestaurant, findMenuItem } from './data/seed.js';

export const MIN_LEAD_MINUTES = 15;   // earliest pickup: 15 minutes from now
export const MAX_AHEAD_HOURS = 12;    // latest pickup: 12 hours from now
export const MAX_QUANTITY = 20;

// Checks an order request from the client.
// Returns { errors } if anything is wrong, otherwise { order } ready to store.
// Prices always come from the menu, never from the client.
export function validateOrder(body, now = new Date()) {
  const errors = [];
  const { restaurantId, customerName, pickupTime, items } = body || {};

  const restaurant = findRestaurant(restaurantId);
  if (!restaurant) errors.push('Unknown restaurant.');

  if (typeof customerName !== 'string' || customerName.trim() === '') {
    errors.push('Customer name is required.');
  } else if (customerName.trim().length > 50) {
    errors.push('Customer name must be 50 characters or less.');
  }

  const orderItems = [];
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item.');
  } else {
    for (const line of items) {
      const menuItem = findMenuItem(line && line.itemId);
      if (!menuItem || (restaurant && menuItem.restaurantId !== restaurant.id)) {
        errors.push(`Item ${line && line.itemId} is not on this restaurant's menu.`);
        continue;
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) {
        errors.push(`Quantity for ${menuItem.name} must be a whole number from 1 to ${MAX_QUANTITY}.`);
        continue;
      }
      orderItems.push({
        itemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: line.quantity,
      });
    }
  }

  const pickup = new Date(pickupTime);
  if (typeof pickupTime !== 'string' || isNaN(pickup)) {
    errors.push('Pickup time is required.');
  } else {
    const minutesAhead = (pickup - now) / 60000;
    if (minutesAhead < MIN_LEAD_MINUTES) {
      errors.push(`Pickup time must be at least ${MIN_LEAD_MINUTES} minutes from now.`);
    } else if (minutesAhead > MAX_AHEAD_HOURS * 60) {
      errors.push(`Pickup time must be within the next ${MAX_AHEAD_HOURS} hours.`);
    }
  }

  if (errors.length > 0) return { errors };

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return {
    errors: [],
    order: {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      customerName: customerName.trim(),
      items: orderItems,
      total: Math.round(total * 100) / 100,
      pickupTime: pickup.toISOString(),
      status: 'Received',
      createdAt: now.toISOString(),
    },
  };
}
