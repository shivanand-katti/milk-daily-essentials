# Backend API

Java 17 / Spring Boot REST API for the Milk & Daily Essentials platform.

## Prerequisites

- JDK 17
- Maven 3.6.3+
- MySQL 8.0+ (or start the repository's local database with Docker Compose)

## Start MySQL with Docker

From the repository root, copy the local environment template and start the database:

```powershell
Copy-Item .env.example .env
docker compose up -d db
```

The compose defaults are only for local development. Never use them in a shared or production environment. Keep the real `.env` file untracked.

## Run migrations and start the API

From the repository root:

```powershell
mvn -f backend/pom.xml spring-boot:run
```

Flyway packages and applies SQL migrations from `database/migrations/` on startup. The default local database is `milk_essentials`, user `milk_app`, at `localhost:3306`. Override with `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables as needed.

## Endpoints

- `GET /api/v1/health` — application API health.
- `GET /api/v1/categories` — active catalog categories.
- `GET /api/v1/products` — paginated active products; supports `categoryId`, `search`, `page`, and `size`.
- `GET /api/v1/products/{id}` — one active product (404 when absent/unavailable).

Example requests after startup:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
Invoke-RestMethod http://localhost:8080/api/v1/categories
Invoke-RestMethod "http://localhost:8080/api/v1/products?page=0&size=20"
Invoke-RestMethod "http://localhost:8080/api/v1/products?search=milk"
```

Prices in V2 are demo values, not current or promised retail prices. Product/category write APIs, authentication, cart, checkout, and order processing are not implemented yet.

## Verify

```powershell
mvn -B -f backend/pom.xml verify
```

The current MVC test covers the health endpoint and does not need a running MySQL instance. The application itself does need MySQL to start because Flyway migrations and JPA schema validation run at startup.
