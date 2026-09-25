?# Requirements — Checkpoint 1: RevoShop Frontend Foundations

## Introduction

This checkpoint proves fluency in the raw building blocks that React and Tailwind sit on top of: semantic HTML, CSS layout (Grid/Flexbox, responsive breakpoints), vanilla JavaScript (DOM manipulation, events, array methods), TypeScript's type system, and Tailwind's utility-first styling. It does not touch Next.js or any backend — those begin in Checkpoint 2.

The deliverable is a single GitHub repository organized into three exercise folders plus a README and screenshots, with a commit history that shows incremental progress across HTML/CSS, JavaScript, TypeScript, and Tailwind.

## Glossary

- **Semantic HTML**: HTML5 sectioning/structural elements (`header`, `nav`, `main`, `section`, `article`, `footer`) used for their meaning rather than generic `div`/`span`.
- **Box model**: The margin / border / padding / content layering that governs element sizing and spacing.
- **Breakpoint**: A viewport width at which layout rules change, expressed via CSS media queries (or Tailwind responsive prefixes).
- **Union type**: A TypeScript type that allows a value to be one of several defined shapes or literal values.
- **Utility-first**: Styling by composing small single-purpose classes (Tailwind) instead of writing bespoke CSS rules.

## Requirements

### Requirement 1 — Repository structure & documentation

**User Story:** As a grader, I want a clearly organized repository, so that I can find and run each exercise without guessing.

#### Acceptance Criteria

1. THE repository SHALL contain a folder for the HTML/CSS profile page (e.g. `html-css/`).
2. THE repository SHALL contain a `javascript/` folder holding the DOM/event exercise and the array-processing exercise as plain JS runnable in the browser.
3. THE repository SHALL contain a `typescript-tailwind/` folder holding a `tsconfig.json`-configured TypeScript project with Tailwind CSS installed.
4. THE repository SHALL contain a root `README.md` that explains what each folder contains and how to run/open it locally.
5. THE repository SHALL contain a location for screenshots (e.g. `screenshots/`) referenced from the README.
6. THE repository SHALL have a `.gitignore` that excludes `node_modules/` and build artifacts.
7. THE repository SHALL accumulate a commit history that shows incremental progress across HTML/CSS, JavaScript, TypeScript, and Tailwind (not one single squashed commit).

### Requirement 2 — Semantic HTML/CSS profile page

**User Story:** As a learner, I want a semantic, responsive profile page with a contact form, so that I demonstrate HTML5 structure, the box model, Grid/Flexbox layout, and responsiveness.

#### Acceptance Criteria

1. THE profile page SHALL be built from semantic HTML5 elements (`header`, `main`, `section`, `footer`, and others as appropriate) rather than generic `div`s for structural regions.
2. THE profile page SHALL include a contact form with appropriate input types (e.g. `text`, `email`, `textarea`) AND each input SHALL have an associated `<label>`.
3. THE stylesheet SHALL style the page using a range of CSS selectors (element, class, descendant, and pseudo-class such as `:hover`/`:focus`) rather than inline styles.
4. THE stylesheet SHALL apply the box model deliberately (margin, border, padding, content) to at least the main layout regions.
5. AT LEAST ONE section of the page SHALL use CSS Grid to build a two-dimensional layout.
6. THE page SHALL use Flexbox for at least one one-dimensional layout region (e.g. nav or a row of items).
7. THE page SHALL include at least one responsive breakpoint via media query, verified to reflow correctly at a mobile width.
8. WHEN viewed at a desktop width THEN the layout SHALL present its multi-column/grid arrangement, AND WHEN viewed at a mobile width THEN the layout SHALL collapse to a single-column-friendly arrangement.

### Requirement 3 — Vanilla JavaScript DOM & event exercise

**User Story:** As a learner, I want a plain-JS DOM exercise, so that I understand what React abstracts away later.

#### Acceptance Criteria

1. THE exercise SHALL be a plain `.js` file loaded by an HTML page and runnable directly in a browser (no framework, no build step).
2. THE script SHALL declare variables with correct data types and use operators and functions to structure logic.
3. THE script SHALL select DOM elements AND update their content or attributes in response to user interaction.
4. THE script SHALL toggle CSS classes on at least one element in response to an event.
5. THE script SHALL create AND remove DOM elements dynamically in response to user interaction.
6. THE script SHALL attach event handlers for at least a `click` and a `submit` event.
7. WHEN a form is submitted THEN the script SHALL call `preventDefault()` so the browser does not perform a full-page navigation.

### Requirement 4 — JavaScript array-processing exercise

**User Story:** As a learner, I want an array-processing exercise, so that I demonstrate iterate/transform/aggregate patterns.

#### Acceptance Criteria

1. THE exercise SHALL be a plain `.js` file runnable in the browser that operates on an array of data.
2. THE exercise SHALL use `forEach` to iterate over the array.
3. THE exercise SHALL use `map` to transform the array into a new array.
4. THE exercise SHALL use `filter` to select a subset of the array.
5. THE exercise SHALL use `reduce` to aggregate the array into a single value.
6. THE results of each operation SHALL be observable (rendered to the page and/or logged), so the behavior can be verified.

### Requirement 5 — TypeScript setup & type modeling

**User Story:** As a learner, I want a properly configured TypeScript project modeling product data that matches my existing backend, so that I demonstrate the type system before styling and carry the model into the final checkpoint unchanged.

#### Acceptance Criteria

1. THE project SHALL include a `tsconfig.json` AND SHALL compile with `tsc` without errors.
2. THE code SHALL define at least one `interface` AND/OR `type` alias to model product-like data.
3. THE code SHALL use at least one union type to model a value that can take more than one shape or state.
4. THE code SHALL correctly type nested objects and arrays (e.g. an array of typed product objects).
5. IF the TypeScript code contains a type error THEN `tsc` SHALL fail the compile (strictness enabled), proving the types are enforced.
6. THE product and category models SHALL mirror the existing RevoShop database: `categories` ids `1` through `4` named `Apparel`, `Footwear`, `Accessories`, `Bags`, AND the `products` columns `id`, `category_id`, `name`, `description`, `price`, `stock_quantity`, `created_at`, `is_delete`. Products SHALL reference a category by id, AND no field SHALL be modeled that the database does not hold.
7. THE product model SHALL store stock as a number AND derive any availability state from it, rather than storing a UI state the database does not have.
8. THE catalog SHALL treat `is_delete` as a soft-delete flag AND exclude flagged rows from rendering, counting, and cart interaction.

### Requirement 6 — Tailwind-styled typed interactive product catalog

**User Story:** As a learner, I want a fully typed, Tailwind-styled interactive product catalog, so that I have the direct predecessor of the Checkpoint 2 React ProductCard.

#### Acceptance Criteria

1. THE catalog SHALL render its product cards from the TypeScript-typed product data (the same data modeled in Requirement 5).
2. Tailwind CSS SHALL be installed and configured in the project, AND styling SHALL use utility classes rather than bespoke custom CSS.
3. THE cards SHALL use Tailwind typography utilities for text AND a mobile-first responsive layout using Tailwind breakpoints.
4. THE catalog SHALL map a typed field to Tailwind class strings (e.g. conditional styling based on a typed field such as stock state or category).
5. WHEN the user types in a search input THEN the catalog SHALL live-filter the rendered products to those matching the query.
6. WHEN the user triggers an interactive state update (e.g. an add-to-cart-style counter) THEN the displayed state SHALL update correctly.
7. WHEN the search query matches no products THEN the catalog SHALL show an empty/no-results state rather than a broken or blank layout.

### Requirement 7 — Screenshots

**User Story:** As a grader, I want screenshots, so that I can confirm the visual results without running everything.

#### Acceptance Criteria

1. THE deliverable SHALL include a screenshot of the profile page at a desktop width AND a screenshot at a mobile width.
2. THE deliverable SHALL include a screenshot of the typed product catalog showing the live search and Tailwind styling in action.
3. THE screenshots SHALL be committed to the repository AND referenced from the README.
