<?php
/**
 * КОНФИГУРАЦИЯ ПРОЕКТА
 */

// Настройки базы данных
// Настройки базы данных
define('DB_HOST', 'localhost');
define('DB_USER', 'developer');
define('DB_PASS', 'dev123');
define('DB_NAME', 'samson_buket');
define('DB_CHARSET', 'utf8mb4');
// define('DB_SOCKET', '/var/run/mysqld/mysqld.sock');

// Настройки сайта
define('SITE_NAME', 'Цветикс');
define('SITE_EMAIL', 'l1m12345612@gmail.com');
define('SITE_PHONE', '+79252944432');

// Настройки доставки
define('DELIVERY_COST', 500);
define('FREE_DELIVERY_THRESHOLD', 3000);

// Настройки безопасности
define('JWT_SECRET', 'your-secret-key-change-in-production');
define('SESSION_LIFETIME', 3600); // 1 час

// Настройки CORS (для API)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка preflight запросов
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Установка часового пояса
date_default_timezone_set('Europe/Moscow');

// Обработка ошибок (в продакшене отключить отображение ошибок)
error_reporting(E_ALL);
ini_set('display_errors', 1); // В продакшене установить в 0


