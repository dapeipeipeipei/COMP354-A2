# API contract

All endpoints are under `/api` and use JSON. Errors always return
`{ "error": "message" }` or, for order validation, `{ "errors": ["message", ...] }`.

## Restaurants and menus (Likun)

### `GET /api/restaurants`
`200` → `[{ id, name, cuisine, address }]`

### `GET /api/restaurants/:id/menu`
`200` → `{ restaurant: { id, name, cuisine, address }, items: [{ id, restaurantId, name, price, description }] }`
`404` → unknown restaurant

Item ids are unique across all restaurants. Prices are numbers in CAD.

## Orders (Wenshuo)

### `POST /api/orders`
Request:
```json
{
  "restaurantId": 2,
  "customerName": "Alex",
  "pickupTime": "2026-10-20T18:30:00.000Z",
  "items": [{ "itemId": 201, "quantity": 2 }]
}
```
`201` → the stored order (see *Order* below)
`400` → `{ "errors": [...] }`, nothing is stored

Validation rules (checked on the server, even if the page already checked):
- restaurant must exist
- customer name required, max 50 characters
- at least one item; every item must be on **that** restaurant's menu
- quantity is a whole number from 1 to 20
- pickup time at least 15 minutes from now and at most 12 hours from now
- prices come from the menu; any price sent by the client is ignored

### `GET /api/orders/:id`
`200` → order, `404` → unknown order

### Order
```json
{
  "id": 1,
  "restaurantId": 2,
  "restaurantName": "Sakura Ramen",
  "customerName": "Alex",
  "items": [{ "itemId": 201, "name": "Tonkotsu Ramen", "price": 15, "quantity": 2 }],
  "total": 30,
  "pickupTime": "2026-10-20T18:30:00.000Z",
  "status": "Received",
  "createdAt": "2026-10-20T18:00:00.000Z"
}
```

## Staff (Chelsea)

### `GET /api/restaurants/:id/orders`
`200` → that restaurant's orders, earliest pickup first. `404` → unknown restaurant

### `PATCH /api/orders/:id/status`
Request: `{ "status": "Preparing" }`
`200` → updated order
`400` → not one of the four statuses
`404` → unknown order
`409` → not the next step (no skipping, no going back)

Status flow: `Received → Preparing → Ready for Pickup → Completed`

## Cart (Jinghao, browser only)

Stored in `localStorage` under `quickbite-cart`:
```json
{ "restaurantId": 2, "restaurantName": "Sakura Ramen",
  "items": [{ "itemId": 201, "name": "Tonkotsu Ramen", "price": 15, "quantity": 2 }] }
```
A cart holds items from one restaurant only. Pickup slots are offered every
15 minutes starting at least 15 minutes from now.
