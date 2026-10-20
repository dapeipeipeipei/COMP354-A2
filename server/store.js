// Placeholder: order storage is implemented by Wenshuo.
export function createStore(file = null) {
  return {
    add(order) { return order; },
    get(id) { return null; },
    listByRestaurant(restaurantId) { return []; },
    updateStatus(id, status) { return null; },
    count() { return 0; },
  };
}
