import { createApp } from './app.js';
import { createStore } from './store.js';

const PORT = process.env.PORT || 3000;

// Orders are saved to data/orders.json so they survive a server restart.
const store = createStore('data/orders.json');
const app = createApp(store);

app.listen(PORT, () => {
  console.log(`QuickBite running at http://localhost:${PORT}`);
});
