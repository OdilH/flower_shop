-- Миграция безопасности (исправленная): добавление customer_id к заказам и таблицы для rate limiting
-- Дата: 2026-01-25
-- Описание: Исправление критических уязвимостей безопасности

USE samson_buket;

-- 1. Проверить и добавить customer_id к таблице orders (если еще не существует)
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'samson_buket'
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'customer_id'
);

-- Добавить customer_id только если его нет
SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE orders ADD COLUMN customer_id INT NULL AFTER order_number, ADD INDEX idx_customer_orders (customer_id)',
    'SELECT "Column customer_id already exists" AS message'
);

PREPAR stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Создать таблицу для отслеживания попыток входа (rate limiting)
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    email VARCHAR(255) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_email (ip_address, email),
    INDEX idx_attempted_at (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Инвалидировать все существующие токены (СРОЧНО!)
-- ВАЖНО: Это заставит всех пользователей войти заново
TRUNCATE TABLE customer_sessions;

-- 4. Очистить старые попытки входа
DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Готово! Теперь система защищена от основных уязвимостей.
