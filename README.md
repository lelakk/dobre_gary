# Dobre Gary

Database course project - kitchenware store application (Java 21, Spring Boot, MariaDB).

## Setup

1. Import the database using the SQL scripts (`schema.sql`, `seed.sql`, `queries.sql`).
2. Copy `src/main/resources/application.properties.example` to `src/main/resources/application.properties` and set your database credentials.
3. Run `pl.dobregary.DobreGaryApplication`.

## Storefront (frontend)

The customer-facing shop lives in [`frontend/`](frontend/README.md). With the backend running:

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.
