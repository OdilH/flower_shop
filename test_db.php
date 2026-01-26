<?php
/**
 * Тест подключения к базе данных
 */

// Настройки из config.php
$host = '127.0.0.1';
$user = 'developer';
$pass = 'dev123';
$dbname = 'samson_buket';

echo "=== Тест подключения к MySQL ===\n\n";

// Попытка подключения
try {
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Подключение к MySQL успешно!\n\n";

    // Показать все базы данных
    echo "Список баз данных:\n";
    echo str_repeat("-", 40) . "\n";

    $stmt = $pdo->query("SHOW DATABASES");
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $exists = false;
    foreach ($databases as $db) {
        $marker = ($db === $dbname) ? " ← ТЕКУЩАЯ" : "";
        echo "  • $db$marker\n";
        if ($db === $dbname) {
            $exists = true;
        }
    }

    echo "\n";

    if ($exists) {
        echo "✅ База данных '$dbname' уже существует!\n\n";

        // Проверить таблицы
        $pdo->exec("USE $dbname");
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (count($tables) > 0) {
            echo "Таблицы в базе '$dbname':\n";
            echo str_repeat("-", 40) . "\n";
            foreach ($tables as $table) {
                // Подсчитать записи
                $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
                echo "  • $table ($count записей)\n";
            }
        } else {
            echo "⚠️  База существует, но таблиц нет (пустая)\n";
        }
    } else {
        echo "❌ База данных '$dbname' НЕ существует\n";
        echo "   Нужно создать и импортировать схему\n";
    }

} catch (PDOException $e) {
    echo "❌ Ошибка подключения: " . $e->getMessage() . "\n";
    echo "\n";
    echo "Возможные причины:\n";
    echo "  • MySQL запущен с auth_socket (нужен sudo)\n";
    echo "  • Неверный пароль\n";
    echo "  • MySQL не запущен\n";
}
