import { once } from 'node:events';
import { createApp } from '../server/app.js';
import { createStore } from '../server/store.js';

// Starts the app on a random free port with an empty in-memory store.
export async function startServer() {
  const store = createStore();
  const server = createApp(store).listen(0);
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api`;
  return { base, store, close: () => server.close() };
}

export async function request(base, path, method = 'GET', body) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

// A pickup time that is always valid: 30 minutes from now.
export function validPickupTime() {
  return new Date(Date.now() + 30 * 60 * 1000).toISOString();
}
