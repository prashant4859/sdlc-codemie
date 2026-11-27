const { test, expect } = require('@playwright/test');

test('UI: can add a task and see it in the list', async ({ page }) => {
  await page.goto('/');
  await page.locator('#title').fill('Read book');
  await page.locator('#add').click();

  // list item contains title text
  await expect(page.locator('#list')).toContainText('Read book');
});

test('UI: can delete a task using Delete button', async ({ page }) => {
  await page.goto('/');
  await page.locator('#title').fill('To delete');
  await page.locator('#add').click();
  await expect(page.locator('#list')).toContainText('To delete');

  // Find the <li> that contains the task text and click its Delete button
  const item = page.locator('#list li', { hasText: 'To delete' });
  await item.getByRole('button', { name: 'Delete' }).click();

  await expect(page.locator('#list')).not.toContainText('To delete');
});

// Expected-failing UI validation tests for requested behavior (not in current public/app.js)

test('UI: empty title should show validation and not create task (expected to fail until UI validation exists)', async ({ page }) => {
  await page.goto('/');
  await page.locator('#title').fill('');
  await page.locator('#add').click();

  // Placeholder expectation for a validation message element/text
  await expect(page.locator('body')).toContainText(/required|empty|title/i);

  // Ensure no blank list item was added
  await expect(page.locator('#list li')).toHaveCount(0);
});

test('UI: whitespace-only title should be blocked (expected to fail until UI validation exists)', async ({ page }) => {
  await page.goto('/');
  await page.locator('#title').fill('   ');
  await page.locator('#add').click();

  await expect(page.locator('body')).toContainText(/required|empty|title/i);
  await expect(page.locator('#list li')).toHaveCount(0);
});
