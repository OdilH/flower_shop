<?php
/**
 * Rate Limiter - Защита от brute-force атак
 */

class RateLimiter
{
    private $conn;
    private $maxAttempts = 5;
    private $blockDuration = 900; // 15 минут в секундах

    public function __construct($connection)
    {
        $this->conn = $connection;
        $this->createTableIfNotExists();
    }

    /**
     * Создать таблицу для отслеживания попыток входа
     */
    private function createTableIfNotExists()
    {
        $sql = "CREATE TABLE IF NOT EXISTS login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip_address VARCHAR(45) NOT NULL,
            email VARCHAR(255) NOT NULL,
            attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ip_email (ip_address, email),
            INDEX idx_attempted_at (attempted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

        $this->conn->query($sql);
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
     * Проверить, заблокирован ли пользователь
     */
    public function isBlocked($email)
    {
        $ip = $this->getClientIp();
        $cutoffTime = date('Y-m-d H:i:s', time() - $this->blockDuration);

        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) as attempt_count 
             FROM login_attempts 
             WHERE (ip_address = ? OR email = ?) 
             AND attempted_at > ?"
        );
        $stmt->bind_param('sss', $ip, $email, $cutoffTime);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        return $row['attempt_count'] >= $this->maxAttempts;
    }

    /**
     * Записать неудачную попытку входа
     */
    public function recordAttempt($email)
    {
        $ip = $this->getClientIp();

        $stmt = $this->conn->prepare(
            "INSERT INTO login_attempts (ip_address, email) VALUES (?, ?)"
        );
        $stmt->bind_param('ss', $ip, $email);
        $stmt->execute();
        $stmt->close();
    }

    /**
     * Очистить попытки входа после успешного входа
     */
    public function clearAttempts($email)
    {
        $ip = $this->getClientIp();

        $stmt = $this->conn->prepare(
            "DELETE FROM login_attempts WHERE ip_address = ? OR email = ?"
        );
        $stmt->bind_param('ss', $ip, $email);
        $stmt->execute();
        $stmt->close();
    }

    /**
     * Очистить старые записи (старше 24 часов)
     */
    public function cleanup()
    {
        $cutoffTime = date('Y-m-d H:i:s', time() - 86400);
        $this->conn->query("DELETE FROM login_attempts WHERE attempted_at < '$cutoffTime'");
    }

    /**
     * Получить оставшееся время блокировки в секундах
     */
    public function getRemainingBlockTime($email)
    {
        $ip = $this->getClientIp();
        $cutoffTime = date('Y-m-d H:i:s', time() - $this->blockDuration);

        $stmt = $this->conn->prepare(
            "SELECT MAX(attempted_at) as last_attempt 
             FROM login_attempts 
             WHERE (ip_address = ? OR email = ?) 
             AND attempted_at > ?"
        );
        $stmt->bind_param('sss', $ip, $email, $cutoffTime);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        if ($row['last_attempt']) {
            $lastAttemptTime = strtotime($row['last_attempt']);
            $blockEndTime = $lastAttemptTime + $this->blockDuration;
            $remaining = $blockEndTime - time();
            return max(0, $remaining);
        }

        return 0;
    }
}
