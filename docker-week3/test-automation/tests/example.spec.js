const { test, expect } = require('@playwright/test');

test.describe('Sample Test Suite', () => {

  test('basic test - homepage loads', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
    console.log('✅ Homepage loaded successfully');
  });

  test('check heading exists', async ({ page }) => {
    await page.goto('https://example.com');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Example Domain');
    console.log('✅ Heading verified');
  });

  test('verify link is clickable', async ({ page }) => {
    await page.goto('https://example.com');
    const link = page.locator('a');
    await expect(link).toBeVisible();
    console.log('✅ Link verified');
  });

  test('check paragraph content', async ({ page }) => {
    await page.goto('https://example.com');
    const paragraph = page.locator('p').first();
    await expect(paragraph).toBeVisible();
    console.log('✅ Paragraph content verified');
  });
});