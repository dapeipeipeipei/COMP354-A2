# QuickBite

COMP 354 A2 — restaurant pickup ordering platform, built by a four-person Scrum team.

Customers browse restaurants, view a menu, add items to a cart, choose a pickup time,
place an order and follow its status. Restaurant staff see incoming orders on a dashboard
and move them through **Received → Preparing → Ready for Pickup → Completed**.

## Run it

Requires **Node.js 22+**.

```bash
npm install
npm start        # http://localhost:3000
npm test         # runs every file in tests/
```

Orders are saved to `data/orders.json` (not committed). Delete that file to start fresh.

## Pages

| Page | Who | What |
|------|-----|------|
| `index.html` | Customer | Restaurant list |
| `menu.html?id=1` | Customer | Menu, add to cart |
| `cart.html` | Customer | Cart, pickup time, place order |
| `order.html?id=1` | Customer | Order status (refreshes every 5 s) |
| `dashboard.html` | Staff | Incoming orders, update status |

## Project layout

```
server/
  index.js            starts the server
  app.js              wires the routes together
  data/seed.js        restaurants and menus             (Likun)
  routes/restaurants.js  GET restaurants / menu         (Likun)
  store.js            order storage (JSON file)         (Wenshuo)
  validation.js       server-side order checks          (Wenshuo)
  routes/orders.js    POST / GET orders                 (Wenshuo)
  status.js           allowed status changes            (Chelsea)
  routes/staff.js     dashboard list + status update    (Chelsea)
public/
  index.html, menu.html, js/restaurants.js, js/menu.js  (Likun)
  cart.html, js/cart.js, js/checkout.js                 (Jinghao)
  order.html, dashboard.html, js/order-status.js, js/dashboard.js  (Chelsea)
  js/api.js, css/style.css                              shared
tests/                one test file per module
docs/api-contract.md  the API every module agrees on
```

## Team workflow

1. Create a branch from `main`: `git checkout -b feature/<name>`
2. Commit in small, meaningful steps
3. Run `npm test` — everything must pass
4. Push and open a Pull Request; another member reviews before merging
