import { Router } from 'express';
import { restaurants, findRestaurant, menuFor } from '../data/seed.js';

export function restaurantsRouter() {
  const router = Router();

  // GET /api/restaurants -> all participating restaurants
  router.get('/restaurants', (req, res) => {
    res.json(restaurants);
  });

  // GET /api/restaurants/:id/menu -> one restaurant and its menu items
  router.get('/restaurants/:id/menu', (req, res) => {
    const restaurant = findRestaurant(Number(req.params.id));
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json({ restaurant, items: menuFor(restaurant.id) });
  });

  return router;
}
