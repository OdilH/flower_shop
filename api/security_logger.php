<?php
/**
 * Security Logger - Логирование подозрительной активности
 */

class SecurityLogger
{
    private $conn;
    private $logFile;

    public function __construct($connection, $logFile = null)
    {
        $this->conn = $connection;
        $this->logFile = $logFile ?? __DIR__ . '/../logs/security.log';
        $this->createTableIfNotExists();
        $this->ensureLogDirectory();
    }

    /**
     * Создать таблицу для логов безопасности
     */
    private function createTableIfNotExists()
    {
        $sql = "CREATE TABLE IF NOT EXISTS security_logs (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        $this->conn->query($sql);
    }

    /**
     * Убедиться что директория для логов существует
     */
    private function ensureLogDirectory()
    {
        $dir = dirname($this->logFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    /**
     * Получить IP адрес клиента
     */
    private function getClientIp()
    {
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
            $ip = $_SERVER['HTTP_X_REAL_IP'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return trim($ip);
    }

    /**
     * Получить User Agent
     */
    private function getUserAgent()
    {
        return $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    }

    /**
     * Записать событие безопасности
     */
    public function log($eventType, $severity, $details = null, $userId = null, $email = null)
    {
        $ip = $this->getClientIp();
        $userAgent = $this->getUserAgent();

        // Записываем в БД
        $stmt = $this->conn->prepare(
            "INSERT INTO security_logs (event_type, severity, ip_address, user_id, email, details, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param('sssssss', $eventType, $severity, $ip, $userId, $email, $details, $userAgent);
        $stmt->execute();
        $stmt->close();

        // Записываем в файл для быстрого доступа
        $logEntry = sprintf(
            "[%s] [%s] %s | IP: %s | User: %s | Details: %s\n",
            date('Y-m-d H:i:s'),
            strtoupper($severity),
            $eventType,
            $ip,
            $email ?? $userId ?? 'guest',
            $details ?? '-'
        );

        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }

    /**
     * Логировать неудачную попытку входа
     */
    public function logFailedLogin($email, $reason = 'Invalid credentials')
    {
        $this->log('failed_login', 'medium', $reason, null, $email);
    }

    /**
     * Логировать подозрительную активность
     */
    public function logSuspiciousActivity($eventType, $details, $userId = null, $email = null)
    {
        $this->log($eventType, 'high', $details, $userId, $email);
    }

    /**
     * Логировать SQL инъекцию попытку
     */
    public function logSqlInjectionAttempt($details, $userId = null)
    {
        $this->log('sql_injection_attempt', 'critical', $details, $userId);
    }

    /**
     * Логировать блокировку по rate limit
     */
    public function logRateLimitBlock($email)
    {
        $this->log('rate_limit_block', 'high', 'Too many login attempts', null, $email);
    }

    /**
     * Логировать успешный вход
     */
    public function logSuccessfulLogin($userId, $email)
    {
        $this->log('successful_login', 'low', 'User logged in', $userId, $email);
    }

    /**
     * Логировать смену пароля
     */
    public function logPasswordChange($userId, $email)
    {
        $this->log('password_change', 'medium', 'Password changed', $userId, $email);
    }

    /**
     * Получить последние логи
     */
    public function getRecentLogs($limit = 100, $severity = null)
    {
        $sql = "SELECT * FROM security_logs";
        if ($severity) {
            $sql .= " WHERE severity = ?";
        }
        $sql .= " ORDER BY created_at DESC LIMIT ?";

        $stmt = $this->conn->prepare($sql);
        if ($severity) {
            $stmt->bind_param('si', $severity, $limit);
        } else {
            $stmt->bind_param('i', $limit);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        $stmt->close();

        return $logs;
    }

    /**
     * Очистить старые логи (старше 90 дней)
     */
    public function cleanup()
    {
        $cutoffDate = date('Y-m-d H:i:s', strtotime('-90 days'));
        $this->conn->query("DELETE FROM security_logs WHERE created_at < '$cutoffDate'");
    }
}
