# RevoShop

The RevoShop storefront frontend, built with Next.js and the App Router, reading live data from the RevoShop Flask API.

## Status

**Checkpoint 2 — in progress.** The Next.js application is being scaffolded. Specs for the work live in `.kiro/specs/checkpoint-2-revoshop-app/`.

## Checkpoint 1 is on a separate branch

The Checkpoint 1 fundamentals exercises — the semantic HTML/CSS profile page, the vanilla JavaScript DOM and array-methods exercises, and the TypeScript + Tailwind typed product catalog — are archived on the [`checkpoint-1`](../../tree/checkpoint-1) branch.

```bash
git checkout checkpoint-1
```

That branch holds its own README with setup and run instructions for those exercises, plus the screenshots submitted as evidence.

## Backend API

This frontend reads from the Flask API built in Module 2:

```
https://web-production-03650.up.railway.app
```

Available read endpoints:

| Endpoint | Notes |
|---|---|
| `GET /products` | Supports `?search=` and `?category_id=`, combinable |
| `GET /products/:id` | Single product |
| `GET /categories` | All categories |
| `GET /orders?user_id=` | Requires a bearer token |

## Repository layout

```
module-3-alzedmkrom/
├─ .kiro/specs/           # requirements, design and task specs
│  ├─ checkpoint-1-revoshop-foundations/
│  └─ checkpoint-2-revoshop-app/
└─ README.md
```

The Next.js project will be added here as the Checkpoint 2 tasks are executed.
