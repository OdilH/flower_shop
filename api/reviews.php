<?php
/**
 * API: ОТЗЫВЫ
 */

require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();
$conn = $db->getConnection();

try {
    switch ($method) {
        case 'GET':
            // Получение отзывов
            $product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : null;
            $approved_only = !isset($_GET['approved']) || $_GET['approved'] === '1';
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
            
            $sql = "SELECT * FROM reviews WHERE 1=1";
            
            if ($product_id) {
                $sql .= " AND product_id = " . intval($product_id);
            }
            
            if ($approved_only) {
                $sql .= " AND approved = 1";
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT " . intval($limit);
            
            $result = $conn->query($sql);
            $reviews = [];
            
            while ($row = $result->fetch_assoc()) {
                $row['rating'] = intval($row['rating']);
                $row['approved'] = (bool)$row['approved'];
                $reviews[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'data' => $reviews
            ], JSON_UNESCAPED_UNICODE);
            break;
            
        case 'POST':
            // Создание нового отзыва
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Валидация
            if (empty($data['customer_name']) || empty($data['rating']) || empty($data['comment'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Заполните все обязательные поля'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $rating = intval($data['rating']);
            if ($rating < 1 || $rating > 5) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Рейтинг должен быть от 1 до 5'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $customer_name = $db->escape($data['customer_name']);
            $customer_email = !empty($data['customer_email']) ? $db->escape($data['customer_email']) : null;
            $comment = $db->escape($data['comment']);
            $product_id = !empty($data['product_id']) ? intval($data['product_id']) : null;
            
            $stmt = $conn->prepare("INSERT INTO reviews (customer_name, customer_email, rating, comment, product_id) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param('ssisi', $customer_name, $customer_email, $rating, $comment, $product_id);
            $stmt->execute();
            $review_id = $conn->insert_id;
            $stmt->close();
            
            echo json_encode([
                'success' => true,
                'message' => 'Отзыв отправлен на модерацию',
                'review_id' => $review_id
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
        'error' => 'Ошибка при обработке запроса',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}


