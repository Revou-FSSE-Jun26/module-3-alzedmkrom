'use client';

// app/dashboard/page.tsx
//
// Admin dashboard for product CRUD. Shows a table of all products with create,
// edit, and delete controls. The delete action asks for confirmation first, and
// surfaces the API's deletion guard message (for example when a product has
// active orders) without reimplementing the guard server-side.
//
// State:
// - products: the product list from GET /products
// - selectedProduct: the product currently being edited (null for create mode)
// - showDeleteConfirm: whether the deletion confirmation is open
// - isLoading / isEditing: request-in-flight flags

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Category, Product, ProductFormState } from '@/lib/types';
import { formatRupiah } from '@/lib/format';
import CreateProductForm from '@/components/CreateProductForm';
import EditProductForm from '@/components/EditProductForm';

type FormMode = 'create' | 'edit';

// Helper to convert form data (strings) to API input (numbers)
function formToInput(data: ProductFormState) {
  return {
    name: data.name,
    description: data.description,
    price: Number(data.price),
    stockQuantity: Number(data.stockQuantity),
    categoryId: Number(data.categoryId),
  };
}

export default function DashboardPage() {
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    product: Product;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch products and categories on mount.
  useEffect(() => {
    async function init() {
      try {
        const [prods, cats] = await Promise.all([
          getProducts({}),
          getCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (error) {
        toastError(error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Guard: token is required for all writes.
  if (!session?.token) {
    return (
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-300">
        You must be logged in to access the dashboard.
      </div>
    );
  }

  const token = session.token;

  async function handleCreateSubmit(data: ProductFormState): Promise<void> {
    setIsEditing(true);
    try {
      const input = formToInput(data);
      const created = await createProduct(input, token);
      // Prepend the new product to the list.
      setProducts((prev) => [created, ...prev]);
      setFormMode('create');
      setSelectedProduct(null);
      toastSuccess('Product created successfully!');
    } catch (error) {
      toastError(error);
      throw error;
    } finally {
      setIsEditing(false);
    }
  }

  async function handleEditSubmit(data: ProductFormState): Promise<void> {
    if (!selectedProduct) return;
    setIsEditing(true);
    try {
      const input = formToInput(data);
      const updated = await updateProduct(selectedProduct.id, input, token);
      // Replace in the list.
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? updated : p)),
      );
      setFormMode('create');
      setSelectedProduct(null);
      toastSuccess('Product updated successfully!');
    } catch (error) {
      toastError(error);
      throw error;
    } finally {
      setIsEditing(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteConfirm) return;
    setIsEditing(true);
    setDeleteError(null);

    try {
      await deleteProduct(deleteConfirm.product.id, token);
      // Remove from the list.
      setProducts((prev) =>
        prev.filter((p) => p.id !== deleteConfirm.product.id),
      );
      setDeleteConfirm(null);
      toastSuccess('Product deleted successfully!');
    } catch (error) {
      // Capture the error message for display inline in the confirmation modal.
      const message = error instanceof Error ? error.message : 'Failed to delete product';
      setDeleteError(message);
      toastError(error);
    } finally {
      setIsEditing(false);
    }
  }

  function openCreateForm(): void {
    setFormMode('create');
    setSelectedProduct(null);
  }

  function openEditForm(product: Product): void {
    setFormMode('edit');
    setSelectedProduct(product);
  }

  function closeForm(): void {
    setFormMode('create');
    setSelectedProduct(null);
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading…</div>;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-black dark:text-white">
        Products
      </h1>

      {/* Form section - full width at top */}
      {formMode === 'create' && (
        <CreateProductForm
          categories={categories}
          isSubmitting={isEditing}
          onSubmit={handleCreateSubmit}
        />
      )}
      {formMode === 'edit' && selectedProduct && (
        <EditProductForm
          product={selectedProduct}
          categories={categories}
          isSubmitting={isEditing}
          onSubmit={handleEditSubmit}
          onCancel={closeForm}
        />
      )}

      {/* Products table - full width below form */}
      {products.length === 0 ? (
        <div className="rounded-md border border-black/10 bg-white p-8 text-center text-black dark:border-white/15 dark:bg-white/5 dark:text-white">
          <p>No products yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full text-sm">
            <thead className="border-b border-black/10 bg-black/5 dark:border-white/15 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-black dark:text-white">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-black dark:text-white">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-semibold text-black dark:text-white">
                  Stock
                </th>
                <th className="px-4 py-3 text-right font-semibold text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/15">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-black/2 dark:hover:bg-white/2"
                >
                  <td className="px-4 py-3 text-black dark:text-white">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white">
                    {product.stockQuantity}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditForm(product)}
                      className="mr-2 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ product })}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-6 shadow-lg dark:border-white/15 dark:bg-black">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Delete Product?
            </h2>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Are you sure you want to delete "{deleteConfirm.product.name}"?
            </p>

            {deleteError && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isEditing}
                className="flex-1 rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isEditing}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEditing ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
    </section>
  );
}
