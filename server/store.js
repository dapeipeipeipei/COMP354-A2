import fs from 'node:fs';
import path from 'node:path';

// Order storage. Keeps orders in memory and, if a file path is given,
// writes them to a JSON file after every change.
// Without a file (used by tests) nothing is written to disk.
export function createStore(file = null) {
  let orders = [];
  if (file && fs.existsSync(file)) {
    orders = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  function save() {
    if (!file) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(orders, null, 2));
  }

  function nextId() {
    return orders.length === 0 ? 1 : Math.max(...orders.map((o) => o.id)) + 1;
  }

  return {
    add(order) {
      const saved = { id: nextId(), ...order };
      orders.push(saved);
      save();
      return saved;
    },

    get(id) {
      return orders.find((o) => o.id === id) || null;
    },

    listByRestaurant(restaurantId) {
      return orders.filter((o) => o.restaurantId === restaurantId);
    },

    updateStatus(id, status) {
      const order = orders.find((o) => o.id === id);
      if (!order) return null;
      order.status = status;
      save();
      return order;
    },

    count() {
      return orders.length;
    },
  };
}
