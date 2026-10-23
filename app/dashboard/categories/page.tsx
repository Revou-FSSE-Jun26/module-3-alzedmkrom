'use client';

// app/dashboard/categories/page.tsx
//
// Admin dashboard for category CRUD. Shows a table of all categories with create,
// edit, and delete controls. The delete action asks for confirmation first, and
// surfaces the API's deletion guard message (for example when a category has
// linked products) without reimplementing the guard server-side.
//
// State:
// - categories: the category list from GET /categories
// - selectedCategory: the category currently being edited (null for create mode)
// - showDeleteConfirm: whether the deletion confirmation is open
// - isLoading / isEditing: request-in-flight flags

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Category, CategoryFormState } from '@/lib/types';
import CreateCategoryForm from '@/components/CreateCategoryForm';
import EditCategoryForm from '@/components/EditCategoryForm';
import Link from 'next/link';

type FormMode = 'create' | 'edit' | null;

export default function CategoriesPage() {
  const { session } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    category: Category;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch categories on mount.
  useEffect(() => {
    async function init() {
      try {
        const cats = await getCategories();
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

  async function handleCreateSubmit(data: CategoryFormState): Promise<void> {
    setIsEditing(true);
    try {
      const created = await createCategory(data, token);
      // Prepend the new category to the list.
      setCategories((prev) => [created, ...prev]);
      setFormMode('create');
      setSelectedCategory(null);
      toastSuccess('Category created successfully!');
    } catch (error) {
      toastError(error);
      throw error;
    } finally {
      setIsEditing(false);
    }
  }

  async function handleEditSubmit(data: CategoryFormState): Promise<void> {
    if (!selectedCategory) return;
    setIsEditing(true);
    try {
      const updated = await updateCategory(selectedCategory.id, data, token);
      // Replace in the list.
      setCategories((prev) =>
        prev.map((c) => (c.id === selectedCategory.id ? updated : c)),
      );
      setFormMode('create');
      setSelectedCategory(null);
      toastSuccess('Category updated successfully!');
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
      await deleteCategory(deleteConfirm.category.id, token);
      // Remove from the list.
      setCategories((prev) =>
        prev.filter((c) => c.id !== deleteConfirm.category.id),
      );
      setDeleteConfirm(null);
      toastSuccess('Category deleted successfully!');
    } catch (error) {
      // Capture the error message for display inline in the confirmation modal.
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      setDeleteError(message);
      toastError(error);
    } finally {
      setIsEditing(false);
    }
  }

  function openCreateForm(): void {
    setFormMode('create');
    setSelectedCategory(null);
  }

  function openEditForm(category: Category): void {
    setFormMode('edit');
    setSelectedCategory(category);
  }

  function closeForm(): void {
    setFormMode(null);
    setSelectedCategory(null);
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading…</div>;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-8">
      <nav className="flex gap-6 border-b border-black/10 dark:border-white/15 pb-4">
        <Link href="/dashboard" className="text-2xl font-bold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white">
          Products
        </Link>
        <Link href="/dashboard/categories" className="text-2xl font-bold text-black dark:text-white hover:text-black/70 dark:hover:text-white/70">
          Categories
        </Link>
        <Link href="/dashboard/orders" className="text-2xl font-bold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white">
          Orders
        </Link>
      </nav>

      {/* Create/Edit form - shown at top when active */}
      {formMode === 'create' && (
        <CreateCategoryForm
          isSubmitting={isEditing}
          onSubmit={handleCreateSubmit}
        />
      )}
      {formMode === 'edit' && (
        <EditCategoryForm
          category={selectedCategory}
          isSubmitting={isEditing}
          onSubmit={handleEditSubmit}
          onCancel={closeForm}
        />
      )}

      {/* Categories table - full width */}
      {categories.length === 0 ? (
        <div className="rounded-md border border-black/10 bg-white p-8 text-center text-black dark:border-white/15 dark:bg-white/5 dark:text-white">
          <p>No categories yet. Create one to get started.</p>
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
                  Description
                </th>
                <th className="px-4 py-3 text-right font-semibold text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/15">
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-black/2 dark:hover:bg-white/2"
                >
                  <td className="px-4 py-3 text-black dark:text-white">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white line-clamp-1">
                    {category.description}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditForm(category)}
                      className="mr-2 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ category })}
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
              Delete Category?
            </h2>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Are you sure you want to delete &quot;{deleteConfirm.category.name}&quot;?
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




