-- ============================================
-- КЛИЕНТЫ - ДОПОЛНИТЕЛЬНАЯ СХЕМА БД
-- ============================================

USE samson_buket;

-- Таблица: customers (клиенты магазина)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    birthday DATE NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT TRUE,
    promo_notifications BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: customer_addresses (адреса доставки)
CREATE TABLE IF NOT EXISTS customer_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    title VARCHAR(100) DEFAULT 'Дом',
    address TEXT NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: customer_favorites (избранное)
CREATE TABLE IF NOT EXISTS customer_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (customer_id, product_id),
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: customer_sessions (сессии)
CREATE TABLE IF NOT EXISTS customer_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Добавляем customer_id в таблицу orders
ALTER TABLE orders 
ADD COLUMN customer_id INT NULL AFTER id,
ADD FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
ADD INDEX idx_customer_id (customer_id);

-- Тестовый клиент (пароль: test123)
INSERT INTO customers (email, password_hash, first_name, last_name, phone) VALUES
('test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Иван', 'Петров', '+7 (999) 123-45-67');

-- Тестовые адреса
INSERT INTO customer_addresses (customer_id, title, address, phone, is_default) VALUES
(1, 'Дом', 'г. Москва, ул. Енисейская, д. 15, кв. 42', '+7 (999) 123-45-67', TRUE),
(1, 'Работа', 'г. Москва, ул. Енисейская, д. 15', '+7 (999) 123-45-67', FALSE);

-- Тестовое избранное
INSERT INTO customer_favorites (customer_id, product_id) VALUES
(1, 1),
(1, 5),
(1, 6);
