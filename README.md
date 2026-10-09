# Milk & Daily Essentials

AI-enabled ordering and delivery platform for milk, groceries, and household essentials.

## Planned stack

- **Mobile customer app:** React Native, Expo, TypeScript
- **Web admin portal:** Angular
- **Backend API:** Java 17, Spring Boot
- **Database:** MySQL 8 with Flyway migrations
- **AI integration:** OpenRouter called from the backend only
- **Local development:** Windows + PowerShell; VS Code / IntelliJ

## Repository layout

```text
admin/                   Angular administration app (planned)
backend/                 Spring Boot REST API (planned)
database/migrations/     Versioned SQL migrations
docs/                    Architecture and local setup
mobile/                  Expo React Native app (planned)
```

## First development milestone

1. Establish database schema for catalog, customers, addresses, orders, and order items.
2. Build Spring Boot health and catalog APIs.
3. Build the mobile catalog and cart experience.
4. Add Angular administration screens.
5. Integrate OpenRouter behind the backend for optional product assistance.

## Security principles

- Never put database credentials, OpenRouter keys, or other secrets in source control.
- Keep AI requests on the backend; mobile and browser clients must not call OpenRouter using a private API key.
- Validate prices and quantities on the server when creating orders.
- Store money as fixed-precision decimal values, never floating-point values.
- Treat migrations as append-only after they are applied to shared environments.

## Local development

See [docs/development.md](docs/development.md) and [docs/architecture.md](docs/architecture.md).

The initial migration is in `database/migrations/V1__initial_schema.sql`. The backend module and clients will be added in subsequent commits.
