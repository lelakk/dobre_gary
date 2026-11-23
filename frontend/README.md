# Dobre Gary — storefront

Customer-facing web shop for the Dobre Gary database project: product catalog, cart and checkout,
built on top of the Spring Boot REST API.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix), lucide-react,
TanStack Query, React Router, Vitest.

## Running locally

1. Start MariaDB and the backend (see the [main README](../README.md)), so the API answers on
   `http://localhost:8080`.
2. Install dependencies and start the dev server (Node.js 22 or newer):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173`. Requests to `/api` are proxied to the backend
   (see `vite.config.ts`), so the backend needs no CORS configuration.

## Scripts

| Command                                   | What it does                                   |
| ----------------------------------------- | ---------------------------------------------- |
| `npm run dev`                             | Dev server with hot reload                     |
| `npm run build`                           | Type-check and build for production to `dist/` |
| `npm test`                                | Unit tests (Vitest)                            |
| `npm run lint`                            | Lint with oxlint                               |
| `npm run format` / `npm run format:check` | Format / check formatting with Prettier        |

## Product images

Photos are looked up by SKU in `public/products/<SKU>.webp`, e.g. `public/products/GAR-001.webp`.
When a file is missing, a placeholder with the SKU is shown, so the shop works without any images.

## Project structure

```text
src/
  api/          typed HTTP client, DTO types and TanStack Query definitions per resource
  app/          app root, router, route paths and query client
  components/   shared components (ui/ holds the generated shadcn/ui components)
  features/     catalog, product, cart and checkout
  lib/          formatting, money arithmetic and parsing helpers
```

## Backend endpoints used

| Endpoint                                          | Used for                                                                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/products`, `GET /api/products/{id}`     | Catalog, product page and cart (price, stock)                                                                                                              |
| `GET /api/categories`                             | Category filter and product categories                                                                                                                     |
| `GET /api/users`, `GET /api/users/{id}/addresses` | Customer and address selection at checkout                                                                                                                 |
| `POST /api/orders/quick`                          | Placing orders through the `sp_place_single_product_order` stored procedure, which checks and decrements stock, computes the total and creates the payment |
| `GET /api/orders/{id}`                            | Order confirmation                                                                                                                                         |

## Known limitations

These are marked with `TODO` in the code:

- The API can only place single-product orders, so each cart line becomes a separate order.
- There is no authentication yet, so checkout lets you pick a customer account from the database.
- The database has no product variants, so the product page shows a placeholder instead of a picker.
