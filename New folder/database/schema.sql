CREATE DATABASE IF NOT EXISTS warehouse_db;

USE warehouse_db;

-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    location_code VARCHAR(30) NOT NULL,
    unit_price DECIMAL(12,2) DEFAULT 0
);

-- 2. Customer orders table
CREATE TABLE IF NOT EXISTS customer_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    picked_quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (order_id)
        REFERENCES customer_orders(id),
    FOREIGN KEY (product_id)
        REFERENCES products(id)
);

-- 4. Picking tasks table
CREATE TABLE IF NOT EXISTS picking_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    location_code VARCHAR(30) NOT NULL,
    quantity_to_pick INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (order_id)
        REFERENCES customer_orders(id),
    FOREIGN KEY (product_id)
        REFERENCES products(id)
);

-- Sample products
INSERT IGNORE INTO products
(sku, name, quantity, location_code, unit_price)
VALUES
('KB101', 'Keyboard', 20, 'A-01', 800),
('MS101', 'Mouse', 30, 'A-05', 400),
('MN101', 'Monitor', 10, 'B-02', 7500),
('HP101', 'Headphones', 15, 'C-01', 1200);

-- Verify database
SHOW TABLES;

SELECT * FROM products;
