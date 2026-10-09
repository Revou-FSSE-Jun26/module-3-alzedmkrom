// components/AddProductForm.tsx
//
// The "add a product" form inside the interactive catalog. A client component,
// because every input is controlled and submission runs a validator in the
// browser. It lives in the ProductList subtree and lifts a valid product up
// through `onAdd`, which ProductList appends with
// setItems((prev) => [newProduct, ...prev]).
//
// This checkpoint is local state only: a valid submit mutates component state,
// it never issues a POST. Real persistence is Checkpoint 3.
//
// Values are held as strings in FormState because that is what inputs produce;
// price and stockQuantity are parsed only inside validate(). On submit the
// handler calls preventDefault() first, then validate(); it proceeds to append
// only when validate() returns no keys. A failed validation leaves every
// entered value in place and renders each message directly beneath its own
// input, wired with aria-describedby and aria-invalid so the error is announced
// and tied to the field rather than conveyed by colour alone.

"use client";

import {
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Category, FormErrors, FormState, Product } from "@/lib/types";

interface AddProductFormProps {
  /** Categories for the dropdown, fetched on the server and passed down. */
  categories: Category[];
  /** Called with a fully-formed Product when validation passes. */
  onAdd: (product: Product) => void;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
};

// Per-field validation. Returns a FormErrors object; an empty object means the
// form is valid. Values arrive as strings and are parsed here. The rules match
// the design: name required and at least 3 characters, description required,
// price required and a positive number, stock required and a whole number >= 0,
// and a category must be chosen.
export function validate(data: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  } else if (data.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!data.description.trim()) {
    errors.description = "Description is required.";
  }

  const price = Number(data.price);
  if (!data.price.trim()) {
    errors.price = "Price is required.";
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be a positive number.";
  }

  const stock = Number(data.stockQuantity);
  if (!data.stockQuantity.trim()) {
    errors.stockQuantity = "Stock quantity is required.";
  } else if (!Number.isInteger(stock) || stock < 0) {
    errors.stockQuantity = "Stock must be zero or a positive whole number.";
  }

  if (!data.categoryId) {
    errors.categoryId = "Choose a category.";
  }

  return errors;
}

// Locally-added products need an id that cannot collide with a real API id.
// API ids are positive, so each locally-added product takes a decreasing
// negative id. Kept in module scope so it survives re-renders of the form.
let nextLocalId = -1;

function buildProduct(data: FormState): Product {
  return {
    id: nextLocalId--,
    categoryId: Number(data.categoryId),
    name: data.name.trim(),
    description: data.description.trim(),
    price: Number(data.price),
    stockQuantity: Number(data.stockQuantity),
    isDeleted: false,
    createdAt: new Date().toISOString(),
    imageUrl: null,
  };
}

export default function AddProductForm({
  categories,
  onAdd,
}: AddProductFormProps) {
  // Controlled form values, held as strings. Preserved across a failed submit
  // so the user never loses what they typed.
  const [values, setValues] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // A unique prefix so error-message ids are stable and collision-free even if
  // the form is ever rendered more than once on a page.
  const fieldId = useId();
  const errorId = (field: keyof FormState) => `${fieldId}-${field}-error`;

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    // preventDefault first, so a failed validation never triggers a full-page
    // submit and the entered values survive.
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    // Proceed only when validate() returned no keys.
    if (Object.keys(nextErrors).length > 0) return;

    // Local state only — no POST. Append through the parent and reset the form.
    onAdd(buildProduct(values));
    setValues(EMPTY_FORM);
    setErrors({});
  }

  const inputClasses =
    "w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40";
  const labelClasses =
    "text-sm font-medium text-black dark:text-white";
  const errorClasses = "text-sm text-red-600 dark:text-red-400";

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-white/5"
    >
      <h2 className="font-semibold text-black dark:text-white">
        Add a product
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
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? errorId("name") : undefined}
          className={inputClasses}
        />
        {errors.name && (
          <p id={errorId("name")} role="alert" className={errorClasses}>
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
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={
            errors.description ? errorId("description") : undefined
          }
          className={inputClasses}
        />
        {errors.description && (
          <p id={errorId("description")} role="alert" className={errorClasses}>
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
          aria-invalid={errors.price ? true : undefined}
          aria-describedby={errors.price ? errorId("price") : undefined}
          className={inputClasses}
        />
        {errors.price && (
          <p id={errorId("price")} role="alert" className={errorClasses}>
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
          aria-invalid={errors.stockQuantity ? true : undefined}
          aria-describedby={
            errors.stockQuantity ? errorId("stockQuantity") : undefined
          }
          className={inputClasses}
        />
        {errors.stockQuantity && (
          <p
            id={errorId("stockQuantity")}
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
        <select
          id={`${fieldId}-categoryId`}
          name="categoryId"
          value={values.categoryId}
          onChange={handleChange}
          aria-invalid={errors.categoryId ? true : undefined}
          aria-describedby={
            errors.categoryId ? errorId("categoryId") : undefined
          }
          className={inputClasses}
        >
          <option value="">Select a category…</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p id={errorId("categoryId")} role="alert" className={errorClasses}>
            {errors.categoryId}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        Add product
      </button>
    </form>
  );
}
