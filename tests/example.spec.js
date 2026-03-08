const { test, expect } = require('@playwright/test');

test('api responds to /health', async ({ request }) => {
  const r = await request.get('/health');
  expect(r.status()).toBe(200);
  const body = await r.json();
  expect(body.status).toBe('ok');
});
