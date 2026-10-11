-- V2: Seed starter catalog for local and first-deployment testing.
-- Product prices are editable sample values in INR; review before taking real orders.

INSERT INTO categories (name, slug, description)
VALUES
    ('Milk & Dairy', 'milk-dairy', 'Milk, curd, paneer and other dairy essentials'),
    ('Daily Essentials', 'daily-essentials', 'Everyday kitchen and household essentials'),
    ('Bakery & Breakfast', 'bakery-breakfast', 'Bread and breakfast basics');

INSERT INTO products
    (category_id, sku, name, description, unit, price, image_url, is_available, stock_quantity)
VALUES
    ((SELECT id FROM categories WHERE slug = 'milk-dairy'), 'MILK-COW-500ML',
     'Fresh Cow Milk', 'Fresh milk for daily use.', '500 ml', 32.00, NULL, TRUE, 100),
    ((SELECT id FROM categories WHERE slug = 'milk-dairy'), 'MILK-COW-1L',
     'Fresh Cow Milk', 'Fresh milk for daily use.', '1 litre', 60.00, NULL, TRUE, 100),
    ((SELECT id FROM categories WHERE slug = 'milk-dairy'), 'MILK-BUFFALO-500ML',
     'Buffalo Milk', 'Rich buffalo milk for daily use.', '500 ml', 38.00, NULL, TRUE, 60),
    ((SELECT id FROM categories WHERE slug = 'milk-dairy'), 'CURD-500G',
     'Fresh Curd', 'Plain curd for meals and snacks.', '500 g', 35.00, NULL, TRUE, 50),
    ((SELECT id FROM categories WHERE slug = 'milk-dairy'), 'PANEER-200G',
     'Fresh Paneer', 'Paneer for everyday cooking.', '200 g', 85.00, NULL, TRUE, 30),
    ((SELECT id FROM categories WHERE slug = 'daily-essentials'), 'EGGS-6',
     'Farm Eggs', 'Pack of six eggs.', '6 pieces', 48.00, NULL, TRUE, 40),
    ((SELECT id FROM categories WHERE slug = 'daily-essentials'), 'SUGAR-1KG',
     'Sugar', 'Everyday household sugar.', '1 kg', 48.00, NULL, TRUE, 50),
    ((SELECT id FROM categories WHERE slug = 'daily-essentials'), 'RICE-1KG',
     'Daily Rice', 'Rice for everyday meals.', '1 kg', 65.00, NULL, TRUE, 60),
    ((SELECT id FROM categories WHERE slug = 'bakery-breakfast'), 'BREAD-400G',
     'Milk Bread', 'Soft bread for breakfast.', '400 g', 40.00, NULL, TRUE, 25);
