-- Миграция безопасности #2 (исправленная): Добавление логирования и дополнительных улучшений
-- Дата: 2026-01-25
-- Описание: Добавление таблицы security_logs и настройка логирования

USE samson_buket;

-- 1. Создать таблицу для логов безопасности
CREATE TABLE IF NOT EXISTS security_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    ip_address VARCHAR(45) NOT NULL,
    user_id INT NULL,
    email VARCHAR(255) NULL,
    details TEXT NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_severity (severity),
    INDEX idx_ip_address (ip_address),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Добавить дополнительный индекс для login_attempts
-- Проверка существования индекса
SET @index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'samson_buket'
    AND TABLE_NAME = 'login_attempts'
    AND INDEX_NAME = 'idx_email_attempted'
);

SET @sql = IF(
    @index_exists = 0,
    'ALTER TABLE login_attempts ADD INDEX idx_email_attempted (email, attempted_at)',
    'SELECT "Index idx_email_attempted already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Готово! Логирование настроено.
