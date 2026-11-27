# Dobre Gary — storefront and admin panel

Web application for the Dobre Gary database project, built on top of the Spring Boot REST API:
a customer-facing shop (catalog, cart, checkout) and an admin panel for managing the data.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix), lucide-react,
TanStack Query, React Router, React Hook Form with Zod, Vitest.

## Running locally

1. Start MariaDB and the backend (see the [main README](../README.md)), so the API answers on
   `http://localhost:8080`.
2. Install dependencies and start the dev server (Node.js 22 or newer):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173` for the store and `http://localhost:5173/admin` for the admin panel
   (also linked as „Panel” in the header). Requests to `/api` are proxied to the backend
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

## Admin panel

| Section    | Route                      | What it does                                                                                  |
| ---------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| Produkty   | `/admin/products`          | Search, create, edit and delete products together with their stock and categories             |
| Kategorie  | `/admin/categories`        | Category tree with product counts; create, edit (no cycles possible) and delete               |
| Klienci    | `/admin/customers`         | Search, create (with password), edit and delete customer accounts                             |
| Klient     | `/admin/customers/:userId` | Customer details and their addresses: add, edit and delete                                    |
| Zamówienia | `/admin/orders`            | Search and filter orders, view line items and customer addresses, change order status         |
| Raporty    | `/admin/reports`           | Browse the 9 analytical SQL queries from `queries.sql` and the `v_product_stock_summary` view |

Forms mirror the validation of the backend DTOs with Polish messages. Rules enforced by the database
are explained instead of showing raw errors: a duplicate SKU or e-mail (409) appears under its field,
and deleting a customer with orders or an address used in an order (foreign keys with `RESTRICT`) is
refused with an explanation. Deleting a category makes its subcategories top-level and only unassigns
its products.

## Project structure

```text
src/
  api/          typed HTTP client, DTO types and TanStack Query definitions per resource
  app/          app root, router, route paths and query client
  components/   shared components (ui/ holds the generated shadcn/ui components)
  features/     catalog, product, cart, checkout and admin (panel sections)
  lib/          formatting, money arithmetic and parsing helpers
```

## Backend endpoints used

| Endpoint                                                                                                    | Used for                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/products`, `GET /api/products/{id}`                                                               | Catalog, product page, cart (price, stock) and the admin product list                                                                                      |
| `GET /api/categories`                                                                                       | Category filter, product categories and the admin category tree                                                                                            |
| `GET /api/users`, `GET /api/users/{id}`, `GET /api/users/{id}/addresses`                                    | Customer and address selection at checkout, admin customer pages                                                                                           |
| `POST /api/orders/quick`                                                                                    | Placing orders through the `sp_place_single_product_order` stored procedure, which checks and decrements stock, computes the total and creates the payment |
| `GET /api/orders`, `GET /api/orders/{id}`, `PATCH /api/orders/{id}/status`                                  | Order confirmation, admin order list and status changes                                                                                                    |
| `GET /api/reports/*`, `GET /api/products/stock-summary`                                                     | Admin analytical reports tab (all 9 queries from `queries.sql` and the `v_product_stock_summary` view)                                                     |
| `POST`, `PUT`, `DELETE` on `/api/products`, `/api/categories`, `/api/users` and `/api/users/{id}/addresses` | Admin panel CRUD                                                                                                                                           |

## Known limitations

- The API can only place single-product orders, so each cart line becomes a separate order.
- There is no authentication yet, so checkout lets you pick a customer account from the database.
- The database has no product variants, so the product page shows a placeholder instead of a picker.
- The admin panel is not protected either: anyone who opens `/admin` can change the data.

The first three are marked with `TODO` in the code.
