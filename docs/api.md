# Initial API contract

Base path: `/api/v1`. Responses are JSON. Prices are decimal numbers in INR for the initial India-focused MVP; the server remains the source of truth for prices and order totals.

## Health

`GET /health`

Example:

```json
{
  "status": "UP",
  "service": "milk-essentials-api",
  "apiVersion": "v1"
}
```

## Categories

`GET /categories`

Returns active categories sorted by name. Each item contains `id`, `name`, `slug`, and `description`.

## Product list and search

`GET /products?categoryId=1&search=milk&page=0&size=20`

All query parameters are optional:

- `categoryId`: only products in that category.
- `search`: case-insensitive match against product name or SKU, up to 100 characters.
- `page`: zero-based page number, default `0`.
- `size`: page size from 1 to 100, default `20`.

The response includes `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, and `last`.

## Product detail

`GET /products/{id}`

Only available products are returned. A missing or unavailable product returns HTTP 404.

## Current limitations

This is a catalog-read milestone. There is no authentication or customer data access, no product management API, and no cart or checkout yet. Clients must not assume a product price remains valid until the server has validated the order.
