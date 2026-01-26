<?php
/**
 * CORS Configuration - Защита от CSRF и настройка разрешенных источников
 */

class CorsPolicy
{
    private $allowedOrigins;
    private $allowedMethods;
    private $allowedHeaders;
    private $maxAge;

    public function __construct()
    {
        // Список разрешенных доменов (настройте под ваши требования)
        $this->allowedOrigins = [
            'https://cvekety.ru',
            'https://www.cvekety.ru',
            'http://localhost:8000', // Для разработки
            'http://127.0.0.1:8000'  // Для разработки
        ];

        $this->allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
        $this->allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'];
        $this->maxAge = 86400; // 24 часа
    }

    /**
     * Применить CORS заголовки
     */
    public function apply()
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Проверяем что origin разрешен
        if ($this->isOriginAllowed($origin)) {
            header("Access-Control-Allow-Origin: $origin");
        }

        // Разрешаем credentials (для cookies и авторизации)
        header('Access-Control-Allow-Credentials: true');

        // Разрешенные методы
        header('Access-Control-Allow-Methods: ' . implode(', ', $this->allowedMethods));

        // Разрешенные заголовки
        header('Access-Control-Allow-Headers: ' . implode(', ', $this->allowedHeaders));

        // Кеширование preflight запросов
        header('Access-Control-Max-Age: ' . $this->maxAge);

        // Обработка preflight запроса
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }

    /**
     * Проверить что origin разрешен
     */
    private function isOriginAllowed($origin)
    {
        // В режиме разработки можно разрешить все origins
        // ВАЖНО: удалите эту строку в продакшене!
        if (defined('DEVELOPMENT_MODE') && DEVELOPMENT_MODE === true) {
            return true;
        }

        return in_array($origin, $this->allowedOrigins);
    }

    /**
     * Добавить разрешенный origin
     */
    public function addAllowedOrigin($origin)
    {
        if (!in_array($origin, $this->allowedOrigins)) {
            $this->allowedOrigins[] = $origin;
        }
    }

    /**
     * Установить разрешенные origins
     */
    public function setAllowedOrigins($origins)
    {
        $this->allowedOrigins = $origins;
    }
}

// Применяем CORS policy глобально для всех API запросов
$corsPolicy = new CorsPolicy();
$corsPolicy->apply();
