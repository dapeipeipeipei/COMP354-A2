import { Router } from 'express';
import { findRestaurant } from '../data/seed.js';
import { STATUSES, canChangeStatus } from '../status.js';

export function staffRouter(store) {
  const router = Router();

  // GET /api/restaurants/:id/orders -> incoming orders for the restaurant dashboard,
  // earliest pickup time first
  router.get('/restaurants/:id/orders', (req, res) => {
    const restaurant = findRestaurant(Number(req.params.id));
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    const orders = store.listByRestaurant(restaurant.id)
      .slice()
      .sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
    res.json(orders);
  });

  // PATCH /api/orders/:id/status -> staff moves an order to the next status
  router.patch('/orders/:id/status', (req, res) => {
    const order = store.get(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}` });
    }
    if (!canChangeStatus(order.status, status)) {
      return res.status(409).json({ error: `Cannot change status from ${order.status} to ${status}` });
    }

    res.json(store.updateStatus(order.id, status));
  });

  return router;
}
