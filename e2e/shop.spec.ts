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

// No pre-existing credentials needed: the test creates a new customer via registration

test.describe('Shopping journey', () => {
  test('browse products list, add to cart, verify cart contents and total, checkout, and confirm new order appears', async ({
    page,
  }) => {
    // Generate unique credentials for this run to avoid API rejecting duplicates
    const uniqueEmail = `shopper-${Date.now()}@example.test`;
    const testUsername = `shopper-${Date.now()}`;
    const testPassword = 'testpassword123';

    // --- Registration (creates a new customer account) ---
    await page.goto('/register');

    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', testPassword);

    await page.click('button[type="submit"]');

    // Wait for navigation to home after successful registration
    await page.waitForURL('/');

    // Verify user is logged in
    await expect(page.getByText(testUsername)).toBeVisible();

    // --- Browse products list ---
    await page.goto('/products');

    // Wait for products to load (heading)
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Wait for the product cards to be visible - ProductCard is rendered as a div with Card styling
    // Each card contains: image, product name (h3), price, and add to cart button
    await page.waitForSelector('button:has-text("Add to cart")', { state: 'visible', timeout: 10000 });

    // Get all "Add to cart" buttons visible on the product cards
    const addToCartButtons = page.locator('button:has-text("Add to cart")');
    const buttonCount = await addToCartButtons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(2);

    // Get all product names (h3 headings within product cards)
    const productNameElements = page.locator('h3');
    const firstProductName = await productNameElements.nth(0).textContent();
    const secondProductName = await productNameElements.nth(1).textContent();

    // Click the first add to cart button
    await addToCartButtons.nth(0).click();

    // Wait for the success toast
    await page.waitForSelector('text=added to cart', { timeout: 5000 });

    // Click the second add to cart button
    await addToCartButtons.nth(1).click();

    // Wait for the second success toast
    await page.waitForSelector('text=added to cart', { timeout: 5000 });

    // --- Navigate to cart ---
    await page.goto('/cart');

    // Verify cart page title (use heading for specificity)
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();

    // --- Assert cart table contents ---
    // The cart should have exactly 2 items
    const cartRows = page.locator('tbody tr');
    const cartItemCount = await cartRows.count();
    expect(cartItemCount).toBe(2);

    // Verify first product is in cart table
    await expect(page.locator(`text=${firstProductName}`)).toBeVisible();

    // Verify second product is in cart table
    await expect(page.locator(`text=${secondProductName}`)).toBeVisible();

    // --- Assert the cart total is displayed ---
    const totalText = page.locator('text=Order Total');
    await expect(totalText).toBeVisible();

    // Capture the total price for later verification
    const totalRow = page.locator('div').filter({ hasText: /Order Total/ });
    const totalPriceText = await totalRow.locator('p').nth(1).textContent();
    expect(totalPriceText).toBeTruthy();

    // --- Proceed to checkout ---
    await page.click('a:has-text("Proceed to Checkout")');

    // Wait for navigation to checkout page
    await page.waitForURL('/checkout');

    // Verify checkout page title (use heading for specificity)
    await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();

    // Verify both items are shown in checkout
    await expect(page.locator(`text=${firstProductName}`)).toBeVisible();
    await expect(page.locator(`text=${secondProductName}`)).toBeVisible();

    // Verify the total is displayed on checkout page
    await expect(page.locator('text=Order Total')).toBeVisible();

    // --- Confirm the order ---
    await page.click('button:has-text("Confirm Order")');

    // Wait for the success toast
    await expect(page.locator('text=Order created successfully')).toBeVisible();

    // Wait for navigation to orders page
    await page.waitForURL('/orders');

    // --- Verify cart is cleared (landing on /orders confirms redirect happened) ---
    // Verify orders page is loaded (use heading for specificity)
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();

    // --- Verify newly created order appears in the list ---
    // The newly created order should appear as a row in the orders table
    const orderRows = page.locator('tbody tr');
    const orderCount = await orderRows.count();

    // There should be at least 1 order
    expect(orderCount).toBeGreaterThanOrEqual(1);

    // The most recent order should be the first row (most recent appears first)
    const latestOrderId = await orderRows.nth(0).locator('td').first().textContent();
    expect(latestOrderId).toBeTruthy();
    expect(latestOrderId).toMatch(/^#\d+$/);

    // Verify the order status is one of the expected statuses
    const statusCell = orderRows.nth(0).locator('td').nth(1);
    const status = await statusCell.textContent();
    expect(['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']).toContain(status?.trim());

    // --- Verify cart is empty by navigating back to cart ---
    await page.goto('/cart');

    // Should see the empty cart message
    await expect(page.locator('text=Your cart is empty')).toBeVisible();

    // Checkout button should not be present (or disabled) in empty state
    const checkoutLink = page.locator('a:has-text("Proceed to Checkout")');
    await expect(checkoutLink).not.toBeVisible();
  });
});
