# Milk & Daily Essentials

AI-enabled ordering and delivery platform for milk, groceries, and household essentials.

## Stack

- **Mobile customer app:** React Native, Expo, TypeScript (planned)
- **Web admin portal:** Angular 20, standalone components, TypeScript
- **Backend API:** Java 17, Spring Boot
- **Database:** MySQL 8 with Flyway migrations
- **AI integration:** OpenRouter called from the backend only
- **Hosting:** Render backend; Angular admin can be deployed as a static site
- **Local development:** Windows + PowerShell; VS Code / IntelliJ

## Repository layout

```text
admin/                   Angular product administration app
backend/                 Spring Boot REST API
database/migrations/     Versioned SQL migrations
docs/                    Architecture and local setup
mobile/                  Expo React Native app (planned)
```

## Angular admin panel

The Angular app currently supports viewing, searching, creating, editing, and deleting products.

### Run locally (Windows PowerShell)

Install Node.js 20.19+ or 22.12+ and npm, then:

```powershell
cd admin
npm install
npm start
```

Open http://localhost:4200. The admin app calls the deployed API at
`https://milk-daily-essentials.onrender.com/api/v1` by default.

### Enable protected product management

Set `ADMIN_API_KEY` as an environment variable in the Render web service. Use a long random secret, and do not commit it to GitHub. After the service redeploys, enter that same key in the admin panel's API access section. The key is kept only in page memory and is not stored in local storage.

Protected endpoints:

- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/{id}`
- `DELETE /api/v1/admin/products/{id}`

All require the `X-Admin-Api-Key` header. The public customer catalog remains `GET /api/v1/products` and only lists available products.

**Security note:** the shared API key is a starter protection, not a substitute for user accounts and role-based authentication. Restrict admin access and replace this mechanism with proper authentication before production use.

## First development milestones

1. Establish database schema for catalog, customers, addresses, orders, and order items.
2. Build Spring Boot health and catalog APIs.
3. Build the Angular product administration screens.
4. Build the mobile catalog and cart experience.
5. Integrate OpenRouter behind the backend for optional product assistance.

## Security principles

- Never put database credentials, OpenRouter keys, admin keys, or other secrets in source control.
- Keep AI requests on the backend; mobile and browser clients must not call OpenRouter using a private API key.
- Validate prices and quantities on the server when creating orders.
- Store money as fixed-precision decimal values, never floating-point values.
- Treat migrations as append-only after they are applied to shared environments.

See [docs/development.md](docs/development.md) and [docs/architecture.md](docs/architecture.md).
