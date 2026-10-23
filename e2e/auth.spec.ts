import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local if they're not already set
const loadEnvFile = () => {
  const envLocalPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        // Only set if not already in process.env
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
};

loadEnvFile();

// Ensure credentials are set before running
test.beforeAll(() => {
  if (!process.env.E2E_ADMIN_EMAIL) {
    throw new Error(
      'E2E_ADMIN_EMAIL environment variable is not set. ' +
        'Set it in .env.local or pass it to the test runner.'
    );
  }
  if (!process.env.E2E_ADMIN_PASSWORD) {
    throw new Error(
      'E2E_ADMIN_PASSWORD environment variable is not set. ' +
        'Set it in .env.local or pass it to the test runner.'
    );
  }
});

test.describe('Authentication flow', () => {
  test('register a new user, verify session persistence, and test login with invalid credentials', async ({
    page,
  }) => {
    // Generate a unique email for this run to avoid API rejecting duplicates
    const uniqueEmail = `e2e-${Date.now()}@example.test`;
    const testUsername = `testuser-${Date.now()}`;
    const testPassword = 'testpassword123';

    // --- Registration ---
    await page.goto('/register');

    // Fill in the registration form using field names for precision
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to complete and assert redirect to home
    await page.waitForURL('/');

    // Assert the username is visible in the header (user-visible text)
    await expect(page.getByText(testUsername)).toBeVisible();

    // --- Session Persistence ---
    // Reload the page
    await page.reload();

    // Wait for the page to be fully loaded
    await page.waitForURL('/');

    // Assert the user is still logged in (username still in header after reload)
    await expect(page.getByText(testUsername)).toBeVisible();

    // --- Logout ---
    // Click the logout button (using user-visible text)
    await page.getByRole('button', { name: 'Log out' }).click();

    // After logout, the username should not be visible
    await expect(page.getByText(testUsername)).not.toBeVisible();

    // The login link should now be visible
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();

    // --- Login with correct credentials ---
    await page.goto('/login');

    // Fill in the login form with the newly registered credentials
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', testPassword);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation and redirect to home
    await page.waitForURL('/');

    // Username should be visible again
    await expect(page.getByText(testUsername)).toBeVisible();

    // --- Logout again for the next test ---
    await page.getByRole('button', { name: 'Log out' }).click();

    // --- Login with invalid credentials ---
    await page.goto('/login');

    // Fill in the login form with wrong password
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should NOT redirect (still on login page)
    await expect(page).toHaveURL('/login');

    // An error message should be visible (user-visible text)
    // The form error is rendered with role="alert"
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
  });
});
