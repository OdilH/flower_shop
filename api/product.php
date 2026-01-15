<?php
/**
 * API: ПОЛУЧЕНИЕ ОДНОГО ТОВАРА
 */

require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $db = Database::getInstance();
    
    // Получаем ID или slug товара
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $slug = isset($_GET['slug']) ? $db->escape($_GET['slug']) : null;
    
    if (!$id && !$slug) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Не указан ID или slug товара'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Строим SQL запрос
    $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.active = 1";
    
    if ($id) {
        $sql .= " AND p.id = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param('i', $id);
    } else {
        $sql .= " AND p.slug = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param('s', $slug);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Товар не найден'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $product = $result->fetch_assoc();
    
    // Обрабатываем изображения
    if (!empty($product['images'])) {
        $product['images'] = json_decode($product['images'], true);
    } else {
        $product['images'] = [];
    }
    
    if (!empty($product['image'])) {
        array_unshift($product['images'], $product['image']);
    }
    
    // Преобразуем типы данных
    $product['price'] = floatval($product['price']);
    $product['old_price'] = $product['old_price'] ? floatval($product['old_price']) : null;
    $product['in_stock'] = (bool)$product['in_stock'];
    $product['is_popular'] = (bool)$product['is_popular'];
    $product['is_new'] = (bool)$product['is_new'];
    $product['quantity'] = intval($product['quantity']);
    
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'data' => $product
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при получении товара',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}


