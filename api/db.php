<?php
/**
 * ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ
 */

require_once __DIR__ . '/config.php';

class Database
{
    private static $instance = null;
    private $conn;

    private function __construct()
    {
        try {
            $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }

            $this->conn->set_charset(DB_CHARSET);
        } catch (Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            die(json_encode([
                'error' => 'Database connection failed',
                // Debug info (remove in production)
                // 'debug_message' => $e->getMessage()
            ]));
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->conn;
    }

    public function query($sql)
    {
        return $this->conn->query($sql);
    }

    public function prepare($sql)
    {
        return $this->conn->prepare($sql);
    }

    public function escape($string)
    {
        return $this->conn->real_escape_string($string);
    }

    public function getLastInsertId()
    {
        return $this->conn->insert_id;
    }

    public function __destruct()
    {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}

// Создаем глобальное подключение для обратной совместимости
$db = Database::getInstance();
$conn = $db->getConnection();


