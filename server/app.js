import express from 'express';
import { fileURLToPath } from 'node:url';
import { createStore } from './store.js';
import { restaurantsRouter } from './routes/restaurants.js';
import { ordersRouter } from './routes/orders.js';
import { staffRouter } from './routes/staff.js';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

// Builds the Express app. Tests pass in their own in-memory store.
export function createApp(store = createStore()) {
  const app = express();
  app.use(express.json());

  app.use('/api', restaurantsRouter());  // restaurant list + menus
  app.use('/api', ordersRouter(store));  // place order + view order
  app.use('/api', staffRouter(store));   // restaurant dashboard + status updates

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(express.static(publicDir));

  // Malformed JSON bodies and unexpected errors.
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Request body must be valid JSON' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  });

  return app;
}
