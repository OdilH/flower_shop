<?php
/**
 * API: АДРЕСА ДОСТАВКИ
 * 
 * Эндпоинты:
 * GET /addresses.php - список адресов
 * POST /addresses.php - создать адрес
 * PUT /addresses.php?id=X - обновить адрес
 * DELETE /addresses.php?id=X - удалить адрес
 * POST /addresses.php?action=set_default&id=X - сделать основным
 */

require_once 'db.php';
require_once 'config.php';
require_once 'auth.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$db = Database::getInstance();
$conn = $db->getConnection();

// Проверка авторизации
$customer = getCurrentCustomer($conn);

if (!$customer) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Не авторизован'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Установить адрес по умолчанию
    if ($action === 'set_default' && $id) {
        // Сбросить все флаги
        $conn->query("UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = " . $customer['id']);
        // Установить новый по умолчанию
        $conn->query("UPDATE customer_addresses SET is_default = TRUE WHERE id = $id AND customer_id = " . $customer['id']);

        echo json_encode([
            'success' => true,
            'message' => 'Адрес установлен как основной'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    switch ($method) {

        case 'GET':
            // Получить все адреса
            $sql = "SELECT * FROM customer_addresses WHERE customer_id = " . $customer['id'] . " ORDER BY is_default DESC, created_at DESC";
            $result = $conn->query($sql);
            $addresses = [];

            while ($row = $result->fetch_assoc()) {
                $addresses[] = $row;
            }

            echo json_encode([
                'success' => true,
                'data' => $addresses
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'POST':
            // Создать адрес
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['address'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Укажите адрес'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $title = !empty($data['title']) ? $conn->real_escape_string($data['title']) : 'Адрес';
            $address = $conn->real_escape_string($data['address']);
            $phone = !empty($data['phone']) ? $conn->real_escape_string($data['phone']) : '';
            $is_default = !empty($data['is_default']) ? 1 : 0;

            // Если это первый адрес или помечен как основной
            $check = $conn->query("SELECT COUNT(*) as cnt FROM customer_addresses WHERE customer_id = " . $customer['id']);
            $count = $check->fetch_assoc()['cnt'];

            if ($count == 0 || $is_default) {
                // Сбросить все флаги
                $conn->query("UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = " . $customer['id']);
                $is_default = 1;
            }

            $stmt = $conn->prepare("INSERT INTO customer_addresses (customer_id, title, address, phone, is_default) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param('isssi', $customer['id'], $title, $address, $phone, $is_default);
            $stmt->execute();
            $new_id = $conn->insert_id;
            $stmt->close();

            echo json_encode([
                'success' => true,
                'message' => 'Адрес добавлен',
                'id' => $new_id
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'PUT':
            // Обновить адрес
            if (!$id) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Укажите ID адреса'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            $updates = [];

            if (isset($data['title'])) {
                $updates[] = "title = '" . $conn->real_escape_string($data['title']) . "'";
            }
            if (isset($data['address'])) {
                $updates[] = "address = '" . $conn->real_escape_string($data['address']) . "'";
            }
            if (isset($data['phone'])) {
                $updates[] = "phone = '" . $conn->real_escape_string($data['phone']) . "'";
            }

            if (!empty($updates)) {
                $sql = "UPDATE customer_addresses SET " . implode(', ', $updates) . " WHERE id = $id AND customer_id = " . $customer['id'];
                $conn->query($sql);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Адрес обновлен'
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'DELETE':
            // Удалить адрес
            if (!$id) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Укажите ID адреса'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $conn->query("DELETE FROM customer_addresses WHERE id = $id AND customer_id = " . $customer['id']);

            echo json_encode([
                'success' => true,
                'message' => 'Адрес удален'
            ], JSON_UNESCAPED_UNICODE);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Метод не поддерживается'
            ], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
