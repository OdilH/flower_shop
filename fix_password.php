<?php
// Временный скрипт для исправления пароля тестового пользователя
// Удалить после использования!

require_once 'api/db.php';

$db = Database::getInstance();
$conn = $db->getConnection();

// Генерируем правильный хеш для пароля test123
$password = 'test123';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "New hash: " . $hash . "<br>";

// Обновляем пользователя
$sql = "UPDATE customers SET password_hash = '$hash' WHERE email = 'test@example.com'";
$result = $conn->query($sql);

if ($result) {
    echo "Password updated successfully!<br>";
    echo "Login: test@example.com<br>";
    echo "Password: test123";
} else {
    echo "Error: " . $conn->error;
}
