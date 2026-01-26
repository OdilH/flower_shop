<?php
/**
 * API: ПОЛУЧЕНИЕ КАТЕГОРИЙ
 */

require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    $sql = "SELECT c.*, COUNT(p.id) as products_count 
            FROM categories c 
            LEFT JOIN products p ON c.id = p.category_id AND p.active = 1 AND p.in_stock = 1
            WHERE c.active = 1 
            GROUP BY c.id 
            ORDER BY c.sort_order ASC, c.name ASC";
    
    $result = $conn->query($sql);
    
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $row['products_count'] = intval($row['products_count']);
        $row['active'] = (bool)$row['active'];
        $categories[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $categories
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при получении категорий',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}


