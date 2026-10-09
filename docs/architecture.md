# Architecture

## Initial shape

```text
Expo mobile app ─────┐
                     ├── HTTPS/JSON ── Spring Boot API ── MySQL
Angular admin ───────┘                       │
                                             └── OpenRouter API
                                                 (server-side only)
```

The backend is the trust boundary for authentication, product pricing, order totals, stock checks, and AI-provider credentials.

## Initial domain model

- **Category** groups catalog products.
- **Product** represents a sellable item with SKU, name, price, unit, and active state.
- **Customer** stores the minimum account profile needed for an order.
- **Address** belongs to a customer and contains delivery instructions.
- **Customer order** captures status, delivery address snapshot, total, and timestamps.
- **Order item** stores product and price snapshots so later catalog price changes do not rewrite historical orders.

## Order lifecycle (initial)

`PENDING` → `CONFIRMED` → `PACKING` → `OUT_FOR_DELIVERY` → `DELIVERED`

A cancellation path and role-specific transitions will be added with the order service. Transitions must be validated in the backend.

## Database conventions

- MySQL 8, InnoDB, UTF-8 (`utf8mb4`).
- Store money in `DECIMAL(12,2)`.
- Store instants in UTC using `TIMESTAMP` and configure application/database sessions consistently.
- Use Flyway migrations in `database/migrations` as the schema source of truth.
- Use foreign keys and indexes for high-use lookup fields.

## AI integration

AI features may help with product discovery, natural-language catalog questions, or support responses. AI output must not determine authoritative pricing, payment state, inventory, refunds, or order status. The backend will use a server-side `OPENROUTER_API_KEY` environment variable and return validated responses to clients.
