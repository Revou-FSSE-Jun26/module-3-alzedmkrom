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

// Ensure admin credentials are set before running
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

test.describe('Admin CRUD dashboard', () => {
  test('create, edit, and delete product; then create, edit, and delete category', async ({
    page,
  }) => {
    // Increase timeout for this complex test
    test.setTimeout(120000);

    const adminEmail = process.env.E2E_ADMIN_EMAIL!;
    const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

    // Generate unique names for this run to avoid conflicts
    const timestamp = Date.now();
    const uniqueProductName = `test-product-${timestamp}`;
    const uniqueCategoryName = `test-category-${timestamp}`;
    const editedProductName = `${uniqueProductName}-edited`;
    const editedCategoryName = `${uniqueCategoryName}-edited`;

    // --- Login as admin ---
    await page.goto('/login');

    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);

    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard (admin goes to /dashboard after login)
    await page.waitForURL('/dashboard', { timeout: 15000 });

    // --- PRODUCT CRUD ---

    // Verify we're on the products page - wait for the products table to appear
    await page.waitForSelector('table tbody', { timeout: 10000 });

    // --- Create Product ---
    // Click the + Add Product button to show the form
    await page.click('button:has-text("+ Add Product")');
    await page.waitForTimeout(300);

    // Now fill in the product creation form
    await page.fill('input[name="name"]', uniqueProductName);
    await page.fill('textarea[name="description"]', 'Test product for e2e admin CRUD');
    await page.fill('input[name="price"]', '50000');
    await page.fill('input[name="stockQuantity"]', '10');

    // Select a category - use selectOption which is more reliable
    const categorySelect = page.locator('select[name="categoryId"]');
    await categorySelect.selectOption('1'); // Select the first available category

    // Submit the form
    await page.click('button:has-text("Create product")');

    // Wait for success toast
    await page.waitForSelector('text=Product created successfully', { timeout: 10000 });

    // Verify product appears in the table
    const productTableRow = page.locator('table tbody').getByText(uniqueProductName);
    await expect(productTableRow).toBeVisible();

    // Verify the product data in the table
    const productRow = page.locator('table tbody tr').filter({ hasText: uniqueProductName });
    await expect(productRow).toContainText('Rp');  // Check for currency symbol
    await expect(productRow).toContainText('10');  // Stock quantity should still be 10

    // --- Edit Product ---
    // Click edit button for the product we just created
    const editButton = productRow.locator('button:has-text("Edit")').first();
    await editButton.click();

    // Wait for the edit form to appear
    await expect(page.locator('input[value="' + uniqueProductName + '"]')).toBeVisible({ timeout: 5000 });

    // Change the product name
    await page.fill('input[name="name"]', editedProductName);
    await page.fill('input[name="price"]', '75000');

    // Submit the edit form (look for Update button)
    await page.click('button:has-text("Save changes")');

    // Wait for success toast
    await page.waitForSelector('text=Product updated successfully', { timeout: 10000 });

    // Verify the update in the table
    const updatedProductRow = page.locator('table tbody tr').filter({ hasText: editedProductName });
    await expect(updatedProductRow).toBeVisible();
    await expect(updatedProductRow).toContainText('Rp');  // Verify price is shown (formatted)

    // --- Delete Product ---
    // Click delete button for the product
    const deleteButton = updatedProductRow.locator('button:has-text("Delete")').first();
    await deleteButton.click();

    // Wait for delete confirmation modal to appear
    await expect(page.locator('text=Delete Product?')).toBeVisible();

    // Confirm deletion by clicking the Delete button in the modal
    // The modal has fixed positioning, so target it specifically
    await page.locator('div.fixed >> button:has-text("Delete")').last().click();

    // Wait for success toast
    await page.waitForSelector('text=Product deleted successfully', { timeout: 10000 });

    // Verify product is removed from the table
    await expect(page.locator('table tbody tr').filter({ hasText: editedProductName })).not.toBeVisible();

    // --- CATEGORY CRUD ---

    // Navigate to categories page
    await page.goto('/dashboard/categories');

    // Verify we're on the categories page - wait for the categories table to appear
    await page.waitForSelector('table tbody', { timeout: 10000 });

    // --- Create Category ---
    // Click the + Add Category button to show the form
    await page.click('button:has-text("+ Add Category")');
    await page.waitForTimeout(300);

    // Now fill in the category creation form
    await page.fill('input[name="name"]', uniqueCategoryName);
    await page.fill('textarea[name="description"]', 'Test category for e2e admin CRUD');

    // Submit the form
    await page.click('button:has-text("Create category")');

    // Wait for success toast
    await page.waitForSelector('text=Category created successfully', { timeout: 10000 });

    // Verify category appears in the table
    const categoryTableRow = page.locator('table tbody').getByText(uniqueCategoryName);
    await expect(categoryTableRow).toBeVisible();

    // Verify the category data in the table
    const categoryRow = page.locator('table tbody tr').filter({ hasText: uniqueCategoryName });
    await expect(categoryRow).toContainText('Test category for e2e admin CRUD');

    // --- Edit Category ---
    // Click edit button for the category we just created
    const categoryEditButton = categoryRow.locator('button:has-text("Edit")').first();
    await categoryEditButton.click();

    // Wait for the edit form to appear
    await expect(page.locator('input[value="' + uniqueCategoryName + '"]')).toBeVisible({ timeout: 5000 });

    // Change the category name
    await page.fill('input[name="name"]', editedCategoryName);
    await page.fill('textarea[name="description"]', 'Updated test category description');

    // Submit the edit form (look for Update button)
    await page.click('button:has-text("Save changes")');

    // Wait for success toast
    await page.waitForSelector('text=Category updated successfully', { timeout: 10000 });

    // Verify the update in the table
    const updatedCategoryRow = page.locator('table tbody tr').filter({ hasText: editedCategoryName });
    await expect(updatedCategoryRow).toBeVisible();
    await expect(updatedCategoryRow).toContainText('Updated test category description');

    // --- Delete Category ---
    // Click delete button for the category
    const categoryDeleteButton = updatedCategoryRow.locator('button:has-text("Delete")').first();
    await categoryDeleteButton.click();

    // Wait for delete confirmation modal to appear
    await expect(page.locator('text=Delete Category?')).toBeVisible();

    // Confirm deletion by clicking the Delete button in the modal
    // The modal has fixed positioning, so target it specifically
    await page.locator('div.fixed >> button:has-text("Delete")').last().click();

    // Wait for success toast
    await page.waitForSelector('text=Category deleted successfully', { timeout: 10000 });

    // Verify category is removed from the table
    await expect(page.locator('table tbody tr').filter({ hasText: editedCategoryName })).not.toBeVisible();
  });
});
