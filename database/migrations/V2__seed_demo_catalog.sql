-- V2: Demo catalog for local development.
-- These prices and products are examples only; replace them before any real launch.

INSERT INTO categories (name, slug, description) VALUES
    ('Milk & Dairy', 'milk-dairy', 'Milk, curd, paneer, and other dairy essentials'),
    ('Fruits & Vegetables', 'fruits-vegetables', 'Fresh produce for everyday cooking'),
    ('Pantry Staples', 'pantry-staples', 'Rice, pulses, flour, and everyday pantry items'),
    ('Household Essentials', 'household-essentials', 'Cleaning and home-use essentials');

INSERT INTO products
    (category_id, sku, name, description, unit, price, is_available, stock_quantity)
SELECT c.id, 'MILK-COW-500', 'Cow Milk', 'Demo catalog item. Confirm sourcing and price before launch.',
       '500 ml', 32.00, TRUE, NULL
FROM categories c WHERE c.slug = 'milk-dairy';

INSERT INTO products
    (category_id, sku, name, description, unit, price, is_available, stock_quantity)
SELECT c.id, 'MILK-TONED-1000', 'Toned Milk', 'Demo catalog item. Confirm sourcing and price before launch.',
       '1 litre', 56.00, TRUE, NULL
FROM categories c WHERE c.slug = 'milk-dairy';

INSERT INTO products
    (category_id, sku, name, description, unit, price, is_available, stock_quantity)
SELECT c.id, 'CURD-400', 'Curd', 'Demo catalog item. Confirm sourcing and price before launch.',
       '400 g', 35.00, TRUE, NULL
FROM categories c WHERE c.slug = 'milk-dairy';

INSERT INTO products
    (category_id, sku, name, description, unit, price, is_available, stock_quantity)
SELECT c.id, 'POTATO-1000', 'Potato', 'Demo catalog item. Confirm sourcing and price before launch.',
       '1 kg', 30.00, TRUE, NULL
FROM categories c WHERE c.slug = 'fruits-vegetables';

INSERT INTO products
    (category_id, sku, name, description, unit, price, is_available, stock_quantity)
SELECT c.id, 'ONION-1000', 'Onion', 'Demo catalog item. Confirm sourcing and price before launch.',
       '1 kg', 40.00, TRUE, NULL
FROM categories c WHERE c.slug = 'fruits-vegetables';

INSERT INTO products
    (category_id, sku, name, description, unit, price, is_available, stock_quantity)
SELECT c.id, 'RICE-1000', 'Everyday Rice', 'Demo catalog item. Confirm sourcing and price before launch.',
       '1 kg', 65.00, TRUE, NULL
FROM categories c WHERE c.slug = 'pantry-staples';

INSERT INTO products
    (category_id, sku, name, description, unit, price, is_available, stock_quantity)
SELECT c.id, 'DISHWASH-500', 'Dishwash Liquid', 'Demo catalog item. Confirm sourcing and price before launch.',
       '500 ml', 99.00, TRUE, NULL
FROM categories c WHERE c.slug = 'household-essentials';
