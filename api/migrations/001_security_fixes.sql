-- Миграция безопасности: добавление customer_id к заказам и таблицы для rate limiting
-- Дата: 2026-01-25
-- Описание: Исправление критических уязвимостей безопасности

-- 1. Добавить customer_id к таблице orders (если еще не существует)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id INT NULL AFTER order_number,
ADD INDEX IF NOT EXISTS idx_customer_id (customer_id);

-- 2. Добавить внешний ключ для customer_id (опционально)
-- ВАЖНО: Раскомментируйте только если хотите строгую связь
-- ALTER TABLE orders 
-- ADD CONSTRAINT fk_orders_customer 
-- FOREIGN KEY (customer_id) REFERENCES customers(id) 
-- ON DELETE SET NULL;

-- 3. Создать таблицу для отслеживания попыток входа (rate limiting)
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    email VARCHAR(255) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_email (ip_address, email),
    INDEX idx_attempted_at (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Инвалидировать все существующие токены (СРОЧНО!)
-- ВАЖНО: Это заставит всех пользователей войти заново
TRUNCATE TABLE customer_sessions;

-- 5. Очистить старые попытки входа
DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Готово! Теперь система защищена от основных уязвимостей.
