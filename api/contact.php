<?php
/**
 * API: ФОРМА ОБРАТНОЙ СВЯЗИ
 */

require_once 'db.php';
require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Метод не поддерживается'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Получаем данные из POST или JSON
    if (!empty($_POST)) {
        $name = isset($_POST['name']) ? trim($_POST['name']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
        $subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
        $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    } else {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = isset($data['name']) ? trim($data['name']) : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $phone = isset($data['phone']) ? trim($data['phone']) : '';
        $subject = isset($data['subject']) ? trim($data['subject']) : '';
        $message = isset($data['message']) ? trim($data['message']) : '';
    }

    // ИСПРАВЛЕНО: Защита от XSS атак
    $name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
    $subject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

    // Валидация
    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Заполните все обязательные поля'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Проверка email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Некорректный email адрес'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Сохраняем в базу данных
    // ИСПРАВЛЕНО: bind_param() уже экранирует данные, не нужно escape()
    $stmt = $conn->prepare("INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param('sssss', $name, $email, $phone, $subject, $message);

    $stmt->execute();
    $contact_id = $conn->insert_id;
    $stmt->close();

    // Отправляем email
    $to = SITE_EMAIL;
    $email_subject = !empty($subject) ? $subject : 'Сообщение с сайта от ' . $name;
    $email_body = "Получено новое сообщение с сайта:\n\n";
    $email_body .= "Имя: {$name}\n";
    $email_body .= "Email: {$email}\n";
    if (!empty($phone)) {
        $email_body .= "Телефон: {$phone}\n";
    }
    if (!empty($subject)) {
        $email_body .= "Тема: {$subject}\n";
    }
    $email_body .= "\nСообщение:\n{$message}\n";

    $email_sent = @mail($to, $email_subject, $email_body, "From: {$email}\r\n");

    echo json_encode([
        'success' => true,
        'message' => 'Сообщение успешно отправлено',
        'contact_id' => $contact_id
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при отправке сообщения'
        // ИСПРАВЛЕНО: Не раскрываем детали
        // 'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}


