# Dobre Gary

Database course project: an online kitchenware store built on a MariaDB database, with a Spring Boot
REST API and a React application (storefront and admin panel).

## Repository layout

| Path            | Contents                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `schema.sql`    | Tables, keys, constraints, indexes and the `v_product_stock_summary` view                        |
| `mock_data.sql` | Seed data                                                                                        |
| `queries.sql`   | 9 analytical queries, triggers, the `sp_place_single_product_order` procedure, transaction demos |
| `src/`          | Spring Boot backend (Java 21)                                                                    |
| `frontend/`     | React application: storefront and admin panel                                                    |
| `docs/`         | Project documentation (ERD, data dictionary, normalization)                                      |

## Running the application

### 1. Database

```bash
docker compose up -d
```

Starts MariaDB on port 3306 and, on the first start, runs `schema.sql`, `mock_data.sql` and
`queries.sql` in that order. Credentials default to `root`/`root` and the `projekt` database; they can
be changed in `.env` (see `.env.example`). To start over with fresh seed data:
`docker compose down -v && docker compose up -d`.

### 2. Backend

1. Copy `src/main/resources/application.properties.example` to
   `src/main/resources/application.properties` and adjust the credentials if needed.
2. Run `pl.dobregary.DobreGaryApplication` (e.g. from IntelliJ) or `mvn spring-boot:run`.

The API listens on `http://localhost:8080`; Swagger UI is at
`http://localhost:8080/swagger-ui/index.html`. Unit tests: `mvn test`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` for the store and `http://localhost:5173/admin` for the admin panel.
Requires Node.js 22 or newer; see [`frontend/README.md`](frontend/README.md).

## Application layer

### Backend (`src/main/java/pl/dobregary`)

| Package      | Responsibility                                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`      | JPA entities mapped to the tables (`ddl-auto=none`: the schema comes from the SQL scripts); MariaDB `ENUM` columns mapped by converters in `model/enums`                                                 |
| `repository` | Spring Data JPA repositories                                                                                                                                                                             |
| `service`    | Business logic in transactions. `OrderService` places orders through the stored procedure (`SimpleJdbcCall`); `ReportService` runs the reports from `queries.sql` (`JdbcTemplate`)                       |
| `controller` | REST endpoints (below)                                                                                                                                                                                   |
| `dto`        | Request/response records with Bean Validation                                                                                                                                                            |
| `exception`  | `GlobalExceptionHandler`: JSON errors with field messages; `404` for missing records, `409` for duplicates and foreign key violations, `400` for validation and trigger errors (e.g. insufficient stock) |

| Endpoints                                 | Operations                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `/api/products`                           | CRUD, `?name=` search, `/stock-summary` (view)                                     |
| `/api/categories`                         | CRUD, `/roots`, `/{id}/subcategories`                                              |
| `/api/users`, `/api/users/{id}/addresses` | CRUD of customers and their addresses                                              |
| `/api/orders`                             | List (`?userId=`), details, `POST /quick` (stored procedure), `PATCH /{id}/status` |
| `/api/reports/*`                          | The 9 queries from `queries.sql`, e.g. `/vip-customers`, `/monthly-revenue`        |

### Frontend (`frontend/`)

- **Storefront:** catalog with search and filters, product page, cart, checkout that places orders
  through the stored procedure (stock errors from the trigger are shown to the shopper) and order
  confirmation.
- **Admin panel (`/admin`):** create, edit and delete products (with stock), categories (as a tree),
  customers and their addresses. Rules enforced by the database are explained in the UI, e.g. a
  customer with orders or an address used in an order cannot be deleted.
