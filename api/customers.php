<?php
/**
 * API: ПРОФИЛЬ И ЗАКАЗЫ КЛИЕНТА
 * 
 * Эндпоинты:
 * GET /customers.php?action=profile - получить профиль
 * PUT /customers.php?action=profile - обновить профиль
 * GET /customers.php?action=orders - история заказов
 */

require_once 'db.php';
require_once 'config.php';
require_once 'auth.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
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
    switch ($action) {

        case 'profile':
            if ($method === 'GET') {
                // Получить профиль
                unset($customer['password_hash']);

                echo json_encode([
                    'success' => true,
                    'data' => $customer
                ], JSON_UNESCAPED_UNICODE);

            } elseif ($method === 'PUT') {
                // Обновить профиль
                $data = json_decode(file_get_contents('php://input'), true);

                $updates = [];

                if (isset($data['first_name'])) {
                    $updates[] = "first_name = '" . $conn->real_escape_string($data['first_name']) . "'";
                }
                if (isset($data['last_name'])) {
                    $updates[] = "last_name = '" . $conn->real_escape_string($data['last_name']) . "'";
                }
                if (isset($data['phone'])) {
                    $updates[] = "phone = '" . $conn->real_escape_string($data['phone']) . "'";
                }
                if (isset($data['birthday'])) {
                    $updates[] = "birthday = '" . $conn->real_escape_string($data['birthday']) . "'";
                }
                if (isset($data['email_notifications'])) {
                    $updates[] = "email_notifications = " . ($data['email_notifications'] ? 1 : 0);
                }
                if (isset($data['sms_notifications'])) {
                    $updates[] = "sms_notifications = " . ($data['sms_notifications'] ? 1 : 0);
                }
                if (isset($data['promo_notifications'])) {
                    $updates[] = "promo_notifications = " . ($data['promo_notifications'] ? 1 : 0);
                }

                if (!empty($updates)) {
                    $sql = "UPDATE customers SET " . implode(', ', $updates) . " WHERE id = " . $customer['id'];
                    $conn->query($sql);
                }

                // Возвращаем обновленный профиль
                $result = $conn->query("SELECT * FROM customers WHERE id = " . $customer['id']);
                $updated = $result->fetch_assoc();
                unset($updated['password_hash']);

                echo json_encode([
                    'success' => true,
                    'message' => 'Профиль обновлен',
                    'data' => $updated
                ], JSON_UNESCAPED_UNICODE);

            } else {
                throw new Exception('Метод не поддерживается');
            }
            break;

        case 'orders':
            if ($method !== 'GET') {
                throw new Exception('Метод не поддерживается');
            }

            // Получить заказы клиента
            $sql = "SELECT o.*, 
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
                    FROM orders o 
                    WHERE o.customer_id = " . $customer['id'] . " 
                    ORDER BY o.created_at DESC";

            $result = $conn->query($sql);
            $orders = [];

            while ($order = $result->fetch_assoc()) {
                // Получаем товары заказа
                $itemsSql = "SELECT oi.*, p.image 
                            FROM order_items oi 
                            LEFT JOIN products p ON oi.product_id = p.id 
                            WHERE oi.order_id = " . $order['id'];
                $itemsResult = $conn->query($itemsSql);
                $items = [];

                while ($item = $itemsResult->fetch_assoc()) {
                    $items[] = $item;
                }

                $order['items'] = $items;
                $order['total_amount'] = floatval($order['total_amount']);
                $order['delivery_cost'] = floatval($order['delivery_cost']);

                // Преобразуем статус в русский
                $statusMap = [
                    'new' => 'Новый',
                    'processing' => 'В обработке',
                    'confirmed' => 'Подтвержден',
                    'delivering' => 'Доставляется',
                    'completed' => 'Доставлен',
                    'cancelled' => 'Отменён'
                ];
                $order['status_text'] = $statusMap[$order['status']] ?? $order['status'];

                $orders[] = $order;
            }

            echo json_encode([
                'success' => true,
                'data' => $orders
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'change_password':
            if ($method !== 'POST') {
                throw new Exception('Метод не поддерживается');
            }

            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['current_password']) || empty($data['new_password'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Введите текущий и новый пароль'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Проверяем текущий пароль
            if (!password_verify($data['current_password'], $customer['password_hash'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Неверный текущий пароль'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Обновляем пароль
            $new_hash = password_hash($data['new_password'], PASSWORD_DEFAULT);
            $conn->query("UPDATE customers SET password_hash = '$new_hash' WHERE id = " . $customer['id']);

            echo json_encode([
                'success' => true,
                'message' => 'Пароль изменен'
            ], JSON_UNESCAPED_UNICODE);
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Неизвестное действие'
            ], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
