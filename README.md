# Milk & Daily Essentials

AI-enabled ordering and delivery platform for milk, groceries, and household essentials.

## Stack

- **Customer storefront:** Static HTML, CSS, and JavaScript consuming the public catalog API
- **Admin portal:** Angular 20, standalone components, TypeScript
- **Backend API:** Java 17, Spring Boot
- **Database:** MySQL 8 with Flyway migrations
- **AI integration:** OpenRouter called from the backend only
- **Hosting:** Render backend and static sites
- **Local development:** Windows + PowerShell; VS Code / IntelliJ

## Repository layout

```text
admin/                   Angular product administration app
backend/                 Spring Boot REST API
database/migrations/     Versioned SQL migrations
docs/                    Architecture and local setup
mobile/                  Expo React Native app (planned)
storefront/              Customer-facing product browsing site
```

## Customer storefront

The static storefront in `storefront/` loads the live catalog from the public endpoint:

`https://milk-daily-essentials.onrender.com/api/v1/products`

Features:
- Responsive product cards with INR prices and pack sizes
- Search by product name, SKU, description, or unit
- Category filters inferred from product details
- Stock indicators and product image support with a visual fallback
- Loading, empty, retry, and API error states
- No administrator credentials are sent from the storefront

### Deploy the storefront on Render

The `render.yaml` blueprint includes a separate static site named `milk-daily-essentials-storefront` with root directory `storefront`. If you manage services manually, create a Render Static Site from this repository and branch, set the root directory to `storefront`, leave the build command empty (or use `echo "No build step required"`), and set the publish directory to `.`.

The backend must be deployed and its public catalog endpoint must be reachable. The backend CORS configuration currently permits cross-origin requests for the public catalog.

## Angular admin portal

The Angular app supports viewing, searching, creating, editing, and deleting catalog products.

### Run locally (Windows PowerShell)

Install Node.js 20.19+ or 22.12+ and npm, then:

```powershell
cd admin
npm install
npm start
```

Open http://localhost:4200. The admin app calls the deployed API at `https://milk-daily-essentials.onrender.com/api/v1` by default.

### Admin authentication

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` as environment variables in the Render backend service. The admin panel uses HTTP Basic authentication for protected endpoints and keeps entered credentials in page memory only.

Protected endpoints:
- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/{id}`
- `DELETE /api/v1/admin/products/{id}`

The customer catalog endpoint `GET /api/v1/products` is public and returns available products only. Never put database credentials or OpenRouter API keys in browser/mobile code or commit secrets to GitHub.

## Current milestones

1. Database schema and Spring Boot health/catalog APIs.
2. Angular product administration.
3. Customer-facing product browsing storefront.
4. Customer cart, checkout, orders, and delivery scheduling.
5. React Native customer app and optional backend AI assistance.

## Security principles

- Never commit database credentials, admin passwords, or API keys.
- Keep OpenRouter calls and its private API key on the backend.
- Validate prices and quantities on the server when creating orders.
- Store money as fixed-precision decimal values, never floating-point values.
- Treat migrations as append-only after they are applied to shared environments.

See [docs/development.md](docs/development.md) and [docs/architecture.md](docs/architecture.md).
