# Database

MySQL 8 schema migrations live in `migrations/` and use Flyway naming conventions.

- `V1__initial_schema.sql` creates catalog, customer, address, order, order-item, and AI interaction audit tables.
- Applied migrations should be treated as immutable; create a new versioned migration for subsequent schema changes.
- Do not store personal data in AI interaction logs unless there is a documented operational requirement.
- AI logs intentionally avoid storing prompts/responses by default.
