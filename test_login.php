<?php
// Тестовый скрипт для проверки входа
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'api/db.php';
require_once 'api/config.php';

echo "<pre>";

$db = Database::getInstance();
$conn = $db->getConnection();

echo "1. Database connected: OK\n\n";

// Проверяем таблицу customers
$result = $conn->query("SELECT * FROM customers WHERE email = 'test@example.com'");
if ($result && $result->num_rows > 0) {
    $customer = $result->fetch_assoc();
    echo "2. Customer found:\n";
    echo "   ID: {$customer['id']}\n";
    echo "   Email: {$customer['email']}\n";
    echo "   Name: {$customer['first_name']} {$customer['last_name']}\n";
    echo "   Hash: " . substr($customer['password_hash'], 0, 60) . "...\n\n";

    // Проверяем пароль
    $password = 'test123';
    if (password_verify($password, $customer['password_hash'])) {
        echo "3. Password verification: OK\n\n";
    } else {
        echo "3. Password verification: FAILED\n\n";
    }

    // Проверяем таблицу сессий
    $result2 = $conn->query("SHOW TABLES LIKE 'customer_sessions'");
    if ($result2->num_rows > 0) {
        echo "4. Table customer_sessions: EXISTS\n\n";

        // Пробуем создать сессию
        $token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', strtotime('+30 days'));

        $stmt = $conn->prepare("INSERT INTO customer_sessions (customer_id, token, expires_at) VALUES (?, ?, ?)");
        if ($stmt) {
            $customer_id = (int) $customer['id'];
            $stmt->bind_param('iss', $customer_id, $token, $expires_at);
            if ($stmt->execute()) {
                echo "5. Session created: OK\n";
                echo "   Token: $token\n\n";
            } else {
                echo "5. Session creation: FAILED - " . $stmt->error . "\n\n";
            }
            $stmt->close();
        } else {
            echo "5. Prepare statement: FAILED - " . $conn->error . "\n\n";
        }
    } else {
        echo "4. Table customer_sessions: DOES NOT EXIST\n\n";
    }

} else {
    echo "2. Customer NOT found\n\n";
}

echo "</pre>";
