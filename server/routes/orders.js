import { Router } from 'express';
import { validateOrder } from '../validation.js';

export function ordersRouter(store) {
  const router = Router();

  // POST /api/orders -> place a new pickup order
  router.post('/orders', (req, res) => {
    const { errors, order } = validateOrder(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    res.status(201).json(store.add(order));
  });

  // GET /api/orders/:id -> one order (used by the customer status page)
  router.get('/orders/:id', (req, res) => {
    const order = store.get(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  return router;
}
