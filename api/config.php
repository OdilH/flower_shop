<?php
/**
 * КОНФИГУРАЦИЯ ПРОЕКТА
 */

// Настройки базы данных
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'samson_buket');
define('DB_CHARSET', 'utf8mb4');

// Настройки сайта
define('SITE_NAME', 'Букеты & цветы');
define('SITE_EMAIL', 'info@samson-buket.ru');
define('SITE_PHONE', '+7 (495) 587-07-07');

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
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Установка часового пояса
date_default_timezone_set('Europe/Moscow');

// Обработка ошибок (в продакшене отключить отображение ошибок)
error_reporting(E_ALL);
ini_set('display_errors', 1); // В продакшене установить в 0


