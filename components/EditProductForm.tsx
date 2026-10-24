'use client';

// components/EditProductForm.tsx
//
// A form for editing an existing product. Mirrors CreateProductForm, but
// pre-fills the form with the product's current values. The validation rules
// are identical to CreateProductForm.

import {
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import type {
  Category,
  FormErrors,
  Product,
  ProductFormState,
} from '@/lib/types';
import { validate } from './CreateProductForm';
import CustomSelect, { type SelectOption } from './CustomSelect';

interface EditProductFormProps {
  product: Product;
  categories: Category[];
  isSubmitting: boolean;
  onSubmit: (data: ProductFormState) => Promise<void>;
  onCancel: () => void;
}

export default function EditProductForm({
  product,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
}: EditProductFormProps) {
  const [values, setValues] = useState<ProductFormState>({
    name: product.name,
    description: product.description,
    price: String(product.price),
    stockQuantity: String(product.stockQuantity),
    categoryId: String(product.categoryId),
  });
  const [errors, setErrors] = useState<FormErrors<ProductFormState>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const fieldId = useId();
  const errorId = (field: keyof ProductFormState) =>
    `${fieldId}-${field}-error`;
  const formErrorId = `${fieldId}-form-error`;

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onSubmit(values);
      // Parent handles toast and table update.
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      }
    }
  }

  const inputClasses =
    'w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40';
  const labelClasses = 'text-sm font-medium text-black dark:text-white';
  const errorClasses = 'text-sm text-red-600 dark:text-red-400';

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={formError ? formErrorId : undefined}
      className="flex w-full flex-col gap-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-white/5"
    >
      <h2 className="text-lg font-semibold text-black dark:text-white">
        Edit Product
      </h2>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${fieldId}-name`} className={labelClasses}>
          Name
        </label>
        <input
          id={`${fieldId}-name`}
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? errorId('name') : undefined}
          className={inputClasses}
        />
        {errors.name && (
          <p id={errorId('name')} role="alert" className={errorClasses}>
            {errors.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${fieldId}-description`} className={labelClasses}>
          Description
        </label>
        <textarea
          id={`${fieldId}-description`}
          name="description"
          rows={3}
          value={values.description}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={
            errors.description ? errorId('description') : undefined
          }
          className={inputClasses}
        />
        {errors.description && (
          <p
            id={errorId('description')}
            role="alert"
            className={errorClasses}
          >
            {errors.description}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${fieldId}-price`} className={labelClasses}>
          Price (Rp)
        </label>
        <input
          id={`${fieldId}-price`}
          name="price"
          type="number"
          inputMode="numeric"
          min="0"
          value={values.price}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={errors.price ? true : undefined}
          aria-describedby={errors.price ? errorId('price') : undefined}
          className={inputClasses}
        />
        {errors.price && (
          <p id={errorId('price')} role="alert" className={errorClasses}>
            {errors.price}
          </p>
        )}
      </div>

      {/* Stock quantity */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${fieldId}-stockQuantity`} className={labelClasses}>
          Stock quantity
        </label>
        <input
          id={`${fieldId}-stockQuantity`}
          name="stockQuantity"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          value={values.stockQuantity}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={errors.stockQuantity ? true : undefined}
          aria-describedby={
            errors.stockQuantity ? errorId('stockQuantity') : undefined
          }
          className={inputClasses}
        />
        {errors.stockQuantity && (
          <p
            id={errorId('stockQuantity')}
            role="alert"
            className={errorClasses}
          >
            {errors.stockQuantity}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${fieldId}-categoryId`} className={labelClasses}>
          Category
        </label>
        <CustomSelect
          id={`${fieldId}-categoryId`}
          ariaLabel="Category"
          options={[
            { value: '', label: 'Select a category…' },
            ...categories.map(
              (category): SelectOption => ({
                value: String(category.id),
                label: category.name,
              }),
            ),
          ]}
          value={values.categoryId}
          onChange={(value) =>
            setValues((prev) => ({ ...prev, categoryId: value }))
          }
          disabled={isSubmitting}
        />
        {errors.categoryId && (
          <p id={errorId('categoryId')} role="alert" className={errorClasses}>
            {errors.categoryId}
          </p>
        )}
      </div>

      {formError && (
        <p
          id={formErrorId}
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
