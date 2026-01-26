<?php
/**
 * API: ПОЛУЧЕНИЕ ТОВАРОВ
 */

require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Получаем параметры запроса
    $category = isset($_GET['category']) ? intval($_GET['category']) : null;
    $category_slug = isset($_GET['category_slug']) ? $db->escape($_GET['category_slug']) : null;
    $search = isset($_GET['search']) ? $db->escape($_GET['search']) : null;
    $popular = isset($_GET['popular']) && $_GET['popular'] === '1';
    $new = isset($_GET['new']) && $_GET['new'] === '1';
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

    // Строим SQL запрос
    $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.active = 1 AND p.in_stock = 1";

    $params = [];
    $types = '';

    // Фильтр по категории (ID)
    if ($category) {
        $sql .= " AND p.category_id = ?";
        $params[] = $category;
        $types .= 'i';
    }

    // Фильтр по категории (slug)
    if ($category_slug) {
        $sql .= " AND c.slug = ?";
        $params[] = $category_slug;
        $types .= 's';
    }

    // Фильтр по популярности
    if ($popular) {
        $sql .= " AND p.is_popular = 1";
    }

    // Фильтр по новинкам
    if ($new) {
        $sql .= " AND p.is_new = 1";
    }

    // Поиск
    if ($search) {
        $sql .= " AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'sss';
    }

    // Сортировка
    $sql .= " ORDER BY p.sort_order ASC, p.created_at DESC";

    // Лимит
    if ($limit > 0) {
        $sql .= " LIMIT ?";
        $params[] = $limit;
        $types .= 'i';

        if ($offset > 0) {
            $sql .= " OFFSET ?";
            $params[] = $offset;
            $types .= 'i';
        }
    }

    // Выполняем запрос
    $stmt = $db->prepare($sql);

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        // Обрабатываем изображения
        if (!empty($row['images'])) {
            $row['images'] = json_decode($row['images'], true);
        } else {
            $row['images'] = [];
        }

        // Добавляем основное изображение в массив
        if (!empty($row['image'])) {
            array_unshift($row['images'], $row['image']);
        }

        // Преобразуем типы данных
        $row['price'] = floatval($row['price']);
        $row['old_price'] = $row['old_price'] ? floatval($row['old_price']) : null;
        $row['in_stock'] = (bool) $row['in_stock'];
        $row['is_popular'] = (bool) $row['is_popular'];
        $row['is_new'] = (bool) $row['is_new'];
        $row['quantity'] = intval($row['quantity']);

        $products[] = $row;
    }

    $stmt->close();

    // Получаем общее количество (для пагинации)
    // ИСПРАВЛЕНО: Используем prepared statements для защиты от SQL injection
    $countSql = "SELECT COUNT(*) as total FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.active = 1 AND p.in_stock = 1";

    $countParams = [];
    $countTypes = '';

    if ($category) {
        $countSql .= " AND p.category_id = ?";
        $countParams[] = $category;
        $countTypes .= 'i';
    }
    if ($category_slug) {
        $countSql .= " AND c.slug = ?";
        $countParams[] = $category_slug;
        $countTypes .= 's';
    }
    if ($popular) {
        $countSql .= " AND p.is_popular = 1";
    }
    if ($new) {
        $countSql .= " AND p.is_new = 1";
    }
    if ($search) {
        $countSql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
        $searchTerm = "%{$search}%";
        $countParams[] = $searchTerm;
        $countParams[] = $searchTerm;
        $countTypes .= 'ss';
    }

    $countStmt = $conn->prepare($countSql);
    if (!empty($countParams)) {
        $countStmt->bind_param($countTypes, ...$countParams);
    }
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $total = $countResult->fetch_assoc()['total'];
    $countStmt->close();

    echo json_encode([
        'success' => true,
        'data' => $products,
        'total' => intval($total),
        'limit' => $limit,
        'offset' => $offset
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при получении товаров'
        // ИСПРАВЛЕНО: В продакшене НЕ показываем детали ошибок
        // 'message' => $e->getMessage()  
    ], JSON_UNESCAPED_UNICODE);
}


