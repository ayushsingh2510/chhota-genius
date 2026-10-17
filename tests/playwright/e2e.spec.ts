import { test, expect } from '@playwright/test';

test.describe('Chhota Genius E2E Flows', () => {
  test('Landing page loads with honest parental advisory and safety commitments', async ({ page }) => {
    await page.goto('/');

    // Check title and brand
    await expect(page).toHaveTitle(/Chhota Genius/);
    await expect(page.locator('text=Chhota Genius').first()).toBeVisible();

    // Verify honest safety disclosure
    await expect(page.locator('text=Parental Advisory Note').first()).toBeVisible();
    await expect(page.locator('text=100% Ad-Free').first()).toBeVisible();
  });

  test('Parent login flow and dashboard overview', async ({ page }) => {
    await page.goto('/login');

    // Use Demo Parent autofill button
    const demoButton = page.locator('text=Auto-fill Demo Parent Account');
    await expect(demoButton).toBeVisible();
    await demoButton.click();

    // Verify filled email
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue('parent.demo@chhotagenius.local');

    // Submit login
    await page.click('button:has-text("Sign In to Parent Dashboard")');

    // Should navigate to parent dashboard
    await expect(page).toHaveURL(/.*parent\/dashboard/);
    await expect(page.locator('text=Parent Command Center').first()).toBeVisible();
    await expect(page.locator('text=Your Children').first()).toBeVisible();
  });

  test('Child mode navigation and interactive activity flow', async ({ page }) => {
    // Navigate directly to seeded child mode
    await page.goto('/child/child_aarav_01');

    // Verify child welcome banner
    await expect(page.locator('text=Welcome, Little Star!').first()).toBeVisible();
    await expect(page.locator('text=Play & Earn Coins').first()).toBeVisible();

    // Open first interactive quiz
    const playButton = page.locator('button:has-text("Play Activity")').first();
    await expect(playButton).toBeVisible();
    await playButton.click();

    // Should be on the activity player page
    await expect(page).toHaveURL(/.*activity.*/);
    await expect(page.locator('text=Check My Answers').first()).toBeVisible();
  });
});
