<?php
/**
 * API: СОЗДАНИЕ И УПРАВЛЕНИЕ ЗАКАЗАМИ
 */

require_once 'db.php';
require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();
$conn = $db->getConnection();

try {
    switch ($method) {
        case 'POST':
            // Создание нового заказа
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Валидация данных
            if (empty($data['customer_name']) || empty($data['customer_phone'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Не заполнены обязательные поля'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            if (empty($data['items']) || !is_array($data['items']) || count($data['items']) === 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Корзина пуста'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            // Подготовка данных
            $customer_name = $db->escape($data['customer_name']);
            $customer_phone = $db->escape($data['customer_phone']);
            $customer_email = !empty($data['customer_email']) ? $db->escape($data['customer_email']) : null;
            $delivery_address = !empty($data['delivery_address']) ? $db->escape($data['delivery_address']) : null;
            $delivery_date = !empty($data['delivery_date']) ? $db->escape($data['delivery_date']) : null;
            $delivery_time = !empty($data['delivery_time']) ? $db->escape($data['delivery_time']) : null;
            $comment = !empty($data['comment']) ? $db->escape($data['comment']) : null;
            $payment_method = !empty($data['payment_method']) ? $db->escape($data['payment_method']) : 'cash';
            
            // Подсчет общей суммы
            $total_amount = 0;
            foreach ($data['items'] as $item) {
                $price = floatval($item['price']);
                $quantity = intval($item['quantity']);
                $total_amount += $price * $quantity;
            }
            
            // Добавляем стоимость доставки
            $delivery_cost = 0;
            if ($total_amount < FREE_DELIVERY_THRESHOLD) {
                $delivery_cost = DELIVERY_COST;
            }
            $total_amount += $delivery_cost;
            
            // Генерируем номер заказа
            $order_number = 'SB-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Начинаем транзакцию
            $conn->begin_transaction();
            
            try {
                // Создаем заказ
                $stmt = $conn->prepare("INSERT INTO orders 
                    (order_number, customer_name, customer_phone, customer_email, delivery_address, 
                     delivery_date, delivery_time, comment, total_amount, delivery_cost, payment_method) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                
                $stmt->bind_param('sssssssdds', 
                    $order_number, $customer_name, $customer_phone, $customer_email, 
                    $delivery_address, $delivery_date, $delivery_time, $comment, 
                    $total_amount, $delivery_cost, $payment_method);
                
                $stmt->execute();
                $order_id = $conn->insert_id;
                $stmt->close();
                
                // Добавляем товары в заказ
                $stmt = $conn->prepare("INSERT INTO order_items 
                    (order_id, product_id, product_name, product_price, quantity, subtotal) 
                    VALUES (?, ?, ?, ?, ?, ?)");
                
                foreach ($data['items'] as $item) {
                    $product_id = !empty($item['id']) ? intval($item['id']) : null;
                    $product_name = $db->escape($item['name']);
                    $product_price = floatval($item['price']);
                    $quantity = intval($item['quantity']);
                    $subtotal = $product_price * $quantity;
                    
                    $stmt->bind_param('iisdid', $order_id, $product_id, $product_name, $product_price, $quantity, $subtotal);
                    $stmt->execute();
                }
                
                $stmt->close();
                
                // Подтверждаем транзакцию
                $conn->commit();
                
                // Отправляем email уведомление (если настроено)
                if (function_exists('mail') && !empty(SITE_EMAIL)) {
                    $subject = "Новый заказ #{$order_number} - " . SITE_NAME;
                    $message = "Получен новый заказ:\n\n";
                    $message .= "Номер заказа: {$order_number}\n";
                    $message .= "Имя: {$customer_name}\n";
                    $message .= "Телефон: {$customer_phone}\n";
                    if ($customer_email) {
                        $message .= "Email: {$customer_email}\n";
                    }
                    $message .= "Сумма: {$total_amount} ₽\n";
                    
                    @mail(SITE_EMAIL, $subject, $message);
                }
                
                echo json_encode([
                    'success' => true,
                    'order_id' => $order_id,
                    'order_number' => $order_number,
                    'total_amount' => $total_amount
                ], JSON_UNESCAPED_UNICODE);
                
            } catch (Exception $e) {
                $conn->rollback();
                throw $e;
            }
            break;
            
        case 'GET':
            // Получение информации о заказе
            $order_id = isset($_GET['id']) ? intval($_GET['id']) : null;
            $order_number = isset($_GET['number']) ? $db->escape($_GET['number']) : null;
            
            if (!$order_id && !$order_number) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Не указан ID или номер заказа'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $sql = "SELECT * FROM orders WHERE ";
            if ($order_id) {
                $sql .= "id = " . intval($order_id);
            } else {
                $sql .= "order_number = '" . $order_number . "'";
            }
            
            $result = $conn->query($sql);
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Заказ не найден'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $order = $result->fetch_assoc();
            
            // Получаем товары заказа
            $itemsSql = "SELECT * FROM order_items WHERE order_id = " . intval($order['id']);
            $itemsResult = $conn->query($itemsSql);
            $items = [];
            while ($row = $itemsResult->fetch_assoc()) {
                $items[] = $row;
            }
            
            $order['items'] = $items;
            $order['total_amount'] = floatval($order['total_amount']);
            $order['delivery_cost'] = floatval($order['delivery_cost']);
            
            echo json_encode([
                'success' => true,
                'data' => $order
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
    if ($conn->in_transaction) {
        $conn->rollback();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при обработке заказа',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}


