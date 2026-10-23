'use client';

// components/CreateCategoryForm.tsx
//
// A form for creating a new category. A Client Component with controlled inputs
// bound to CategoryFormState. The validation rules match the design:
// - name non-empty
//
// On submit, calls the parent's onSubmit callback with the validated form
// state. The parent handles the API call and manages loading state.

import {
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import type {
  CategoryFormState,
  FormErrors,
} from '@/lib/types';

interface CreateCategoryFormProps {
  isSubmitting: boolean;
  onSubmit: (data: CategoryFormState) => Promise<void>;
}

const EMPTY_FORM: CategoryFormState = {
  name: '',
  description: '',
};

export function validate(
  data: CategoryFormState,
): FormErrors<CategoryFormState> {
  const errors: FormErrors<CategoryFormState> = {};

  if (!data.name.trim()) {
    errors.name = 'Name is required.';
  }

  return errors;
}

export default function CreateCategoryForm({
  isSubmitting,
  onSubmit,
}: CreateCategoryFormProps) {
  const [values, setValues] = useState<CategoryFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors<CategoryFormState>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const fieldId = useId();
  const errorId = (field: keyof CategoryFormState) =>
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
      // Reset form on success; parent handles the toast and table update.
      setValues(EMPTY_FORM);
      setErrors({});
    } catch (error) {
      // Parent handles the toast, so just clear the submitting state here.
      // If there's a form-level error we want to surface, capture it.
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
        Create Category
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

      {formError && (
        <p
          id={formErrorId}
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Creating…' : 'Create category'}
      </button>
    </form>
  );
}
