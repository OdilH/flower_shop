-- Миграция безопасности #2: Добавление логирования и дополнительных улучшений
-- Дата: 2026-01-25
-- Описание: Добавление таблицы security_logs и настройка логирования

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

-- 2. Добавить индексы для оптимизации запросов логирования
ALTER TABLE login_attempts ADD INDEX IF NOT EXISTS idx_email_attempted (email, attempted_at);

-- 3. Создать директорию для логов (выполните вручную на сервере)
-- mkdir -p /var/www/cvekety.ru/logs
-- chmod 755 /var/www/cvekety.ru/logs
-- chown www-data:www-data /var/www/cvekety.ru/logs

-- Готово! Логирование настроено.
