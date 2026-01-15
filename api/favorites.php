<?php
/**
 * API: ИЗБРАННОЕ
 * 
 * Эндпоинты:
 * GET /favorites.php - список избранного
 * POST /favorites.php - добавить в избранное
 * DELETE /favorites.php?product_id=X - удалить из избранного
 */

require_once 'db.php';
require_once 'config.php';
require_once 'auth.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
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
    switch ($method) {

        case 'GET':
            // Получить избранное с данными товаров
            $sql = "SELECT p.*, cf.created_at as added_at
                    FROM customer_favorites cf
                    JOIN products p ON cf.product_id = p.id
                    WHERE cf.customer_id = " . $customer['id'] . "
                    ORDER BY cf.created_at DESC";

            $result = $conn->query($sql);
            $favorites = [];

            while ($row = $result->fetch_assoc()) {
                $row['price'] = floatval($row['price']);
                if ($row['old_price']) {
                    $row['old_price'] = floatval($row['old_price']);
                }
                $favorites[] = $row;
            }

            echo json_encode([
                'success' => true,
                'data' => $favorites
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'POST':
            // Добавить в избранное
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['product_id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Укажите product_id'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $product_id = intval($data['product_id']);

            // Проверяем существование товара
            $check = $conn->query("SELECT id FROM products WHERE id = $product_id");
            if ($check->num_rows === 0) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Товар не найден'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Добавляем (IGNORE для избежания дубликатов)
            $conn->query("INSERT IGNORE INTO customer_favorites (customer_id, product_id) VALUES (" . $customer['id'] . ", $product_id)");

            echo json_encode([
                'success' => true,
                'message' => 'Добавлено в избранное'
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'DELETE':
            // Удалить из избранного
            $product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : null;

            if (!$product_id) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Укажите product_id'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $conn->query("DELETE FROM customer_favorites WHERE customer_id = " . $customer['id'] . " AND product_id = $product_id");

            echo json_encode([
                'success' => true,
                'message' => 'Удалено из избранного'
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
