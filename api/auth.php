<?php
/**
 * API: АВТОРИЗАЦИЯ КЛИЕНТОВ
 * 
 * Эндпоинты:
 * POST /auth.php?action=register - регистрация
 * POST /auth.php?action=login - вход
 * POST /auth.php?action=logout - выход
 * GET /auth.php?action=me - текущий пользователь
 */

// Очистка возможного BOM или пробелов
ob_start();
require_once 'db.php';
require_once 'config.php';
require_once 'rate_limiter.php';
require_once 'security_logger.php';
require_once 'cors.php'; // CORS policy
ob_end_clean();

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$db = Database::getInstance();
$conn = $db->getConnection();

// Инициализация логгера безопасности
$securityLogger = new SecurityLogger($conn);

try {
    switch ($action) {

        case 'register':
            if ($method !== 'POST') {
                throw new Exception('Метод не поддерживается');
            }

            $data = json_decode(file_get_contents('php://input'), true);

            // Валидация
            if (empty($data['email']) || empty($data['password']) || empty($data['first_name'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Заполните обязательные поля: email, пароль, имя'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Проверка формата email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Неверный формат email'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Проверка пароля
            if (strlen($data['password']) < 6) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Пароль должен содержать минимум 6 символов'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Проверка существования email (ИСПРАВЛЕНО: используем prepared statement)
            $stmt = $conn->prepare("SELECT id FROM customers WHERE email = ?");
            $stmt->bind_param('s', $data['email']);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $stmt->close();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Пользователь с таким email уже существует'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $stmt->close();

            // Хеширование пароля
            $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
            $first_name = $data['first_name'];
            $last_name = !empty($data['last_name']) ? $data['last_name'] : '';
            $phone = !empty($data['phone']) ? $data['phone'] : '';
            $email = $data['email'];

            // Создание пользователя
            $stmt = $conn->prepare("INSERT INTO customers (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param('sssss', $email, $password_hash, $first_name, $last_name, $phone);
            $stmt->execute();
            $customer_id = $conn->insert_id;
            $stmt->close();

            // Создание сессии
            $token = bin2hex(random_bytes(32));
            $expires_at = date('Y-m-d H:i:s', strtotime('+30 days'));

            $stmt = $conn->prepare("INSERT INTO customer_sessions (customer_id, token, expires_at) VALUES (?, ?, ?)");
            $stmt->bind_param('iss', $customer_id, $token, $expires_at);
            $stmt->execute();
            $stmt->close();

            echo json_encode([
                'success' => true,
                'message' => 'Регистрация успешна',
                'token' => $token,
                'user' => [
                    'id' => $customer_id,
                    'email' => $data['email'],
                    'first_name' => $first_name,
                    'last_name' => $last_name
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'login':
            if ($method !== 'POST') {
                throw new Exception('Метод не поддерживается');
            }

            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['email']) || empty($data['password'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Введите email и пароль'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Проверка rate limiting (НОВОЕ)
            $rateLimiter = new RateLimiter($conn);
            if ($rateLimiter->isBlocked($data['email'])) {
                $remainingTime = $rateLimiter->getRemainingBlockTime($data['email']);
                $minutes = ceil($remainingTime / 60);
                $securityLogger->logRateLimitBlock($data['email']);
                http_response_code(429);
                echo json_encode([
                    'success' => false,
                    'error' => "Превышено количество попыток входа. Попробуйте снова через {$minutes} минут."
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Поиск пользователя (ИСПРАВЛЕНО: prepared statement)
            $stmt = $conn->prepare("SELECT * FROM customers WHERE email = ? AND active = TRUE");
            $stmt->bind_param('s', $data['email']);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                $stmt->close();
                $rateLimiter->recordAttempt($data['email']);
                $securityLogger->logFailedLogin($data['email'], 'User not found');
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Неверный email или пароль'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $customer = $result->fetch_assoc();

            $stmt->close();

            // Проверка пароля
            if (!password_verify($data['password'], $customer['password_hash'])) {
                $rateLimiter->recordAttempt($data['email']);
                $securityLogger->logFailedLogin($data['email'], 'Invalid password');
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Неверный email или пароль'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Очищаем попытки входа после успешного входа
            $rateLimiter->clearAttempts($data['email']);
            $securityLogger->logSuccessfulLogin($customer['id'], $data['email']);

            // Обновляем last_login (ИСПРАВЛЕНО: prepared statement)
            $stmt = $conn->prepare("UPDATE customers SET last_login = NOW() WHERE id = ?");
            $stmt->bind_param('i', $customer['id']);
            $stmt->execute();
            $stmt->close();

            // Создание новой сессии
            $token = bin2hex(random_bytes(32));
            $expires_at = date('Y-m-d H:i:s', strtotime('+30 days'));

            $stmt = $conn->prepare("INSERT INTO customer_sessions (customer_id, token, expires_at) VALUES (?, ?, ?)");
            $customer_id = (int) $customer['id'];
            $stmt->bind_param('iss', $customer_id, $token, $expires_at);
            $stmt->execute();
            $stmt->close();

            echo json_encode([
                'success' => true,
                'message' => 'Вход выполнен успешно',
                'token' => $token,
                'user' => [
                    'id' => $customer['id'],
                    'email' => $customer['email'],
                    'first_name' => $customer['first_name'],
                    'last_name' => $customer['last_name'],
                    'phone' => $customer['phone']
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'logout':
            if ($method !== 'POST') {
                throw new Exception('Метод не поддерживается');
            }

            $token = getBearerToken();

            if ($token) {
                // ИСПРАВЛЕНО: prepared statement
                $stmt = $conn->prepare("DELETE FROM customer_sessions WHERE token = ?");
                $stmt->bind_param('s', $token);
                $stmt->execute();
                $stmt->close();
            }

            echo json_encode([
                'success' => true,
                'message' => 'Выход выполнен'
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'me':
            if ($method !== 'GET') {
                throw new Exception('Метод не поддерживается');
            }

            $customer = getCurrentCustomer($conn);

            if (!$customer) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Не авторизован'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Убираем пароль из ответа
            unset($customer['password_hash']);

            echo json_encode([
                'success' => true,
                'user' => $customer
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

/**
 * Получить токен из заголовка Authorization
 */
function getBearerToken()
{
    $headers = getallheaders();

    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }

    // ИСПРАВЛЕНО: Удалена поддержка токена в GET параметрах для безопасности
    // Токен должен передаваться ТОЛЬКО через Authorization header

    return null;
}

/**
 * Получить текущего авторизованного клиента
 */
function getCurrentCustomer($conn)
{
    $token = getBearerToken();

    if (!$token) {
        return null;
    }

    // ИСПРАВЛЕНО: prepared statement
    $sql = "SELECT c.* FROM customers c 
            JOIN customer_sessions s ON c.id = s.customer_id 
            WHERE s.token = ? 
            AND s.expires_at > NOW() 
            AND c.active = TRUE";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        return null;
    }

    $customer = $result->fetch_assoc();
    $stmt->close();

    return $customer;
}
