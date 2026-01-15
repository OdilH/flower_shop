# ИНСТРУКЦИЯ ПО УСТАНОВКЕ BACKEND

## Требования

- PHP 7.4 или выше
- MySQL 5.7 или выше (или MariaDB)
- Apache/Nginx с поддержкой mod_rewrite
- Расширения PHP: mysqli, pdo_mysql, mbstring

## Установка

### 1. Настройка базы данных

1. Создайте базу данных MySQL:
```sql
CREATE DATABASE samson_buket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Импортируйте схему:
```bash
mysql -u root -p samson_buket < database/schema.sql
```

Или через phpMyAdmin:
- Откройте phpMyAdmin
- Выберите базу данных `samson_buket`
- Перейдите на вкладку "Импорт"
- Выберите файл `database/schema.sql`
- Нажмите "Вперед"

### 2. Настройка конфигурации

Откройте файл `api/config.php` и измените настройки:

```php
// Настройки базы данных
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'samson_buket');

// Настройки сайта
define('SITE_EMAIL', 'info@samson-buket.ru');
define('SITE_PHONE', '+7 (495) 587-07-07');
```

### 3. Настройка веб-сервера

#### Apache (.htaccess)

Убедитесь, что mod_rewrite включен:
```bash
sudo a2enmod rewrite
sudo service apache2 restart
```

#### Nginx

Добавьте в конфигурацию:
```nginx
location /api {
    try_files $uri $uri/ /api/$uri;
}
```

### 4. Права доступа

Установите правильные права на файлы:
```bash
chmod 644 api/*.php
chmod 755 api/
chmod 644 admin/*.php
chmod 755 admin/
```

### 5. Проверка установки

1. Откройте в браузере: `http://your-domain.ru/api/categories.php`
   - Должен вернуться JSON с категориями

2. Проверьте админ-панель: `http://your-domain.ru/admin/login.php`
   - Логин: `admin`
   - Пароль: `admin123`

⚠️ **ВАЖНО:** Сразу после установки измените пароль администратора!

## Изменение пароля администратора

Выполните SQL запрос:
```sql
UPDATE users 
SET password_hash = '$2y$10$...' 
WHERE username = 'admin';
```

Или используйте PHP скрипт:
```php
<?php
require_once 'api/db.php';
$db = Database::getInstance();
$conn = $db->getConnection();

$new_password = 'your_new_password';
$hash = password_hash($new_password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE username = 'admin'");
$stmt->bind_param('s', $hash);
$stmt->execute();
echo "Пароль изменен!";
?>
```

## API Endpoints

### Тестирование API

**Получить категории:**
```
GET http://your-domain.ru/api/categories.php
```

**Получить товары:**
```
GET http://your-domain.ru/api/products.php?popular=1&limit=10
```

**Создать заказ:**
```
POST http://your-domain.ru/api/orders.php
Content-Type: application/json

{
  "customer_name": "Иван Иванов",
  "customer_phone": "+79991234567",
  "items": [
    {
      "id": 1,
      "name": "Букет из 25 роз",
      "price": 2500.00,
      "quantity": 1
    }
  ]
}
```

## Безопасность

### Для продакшена:

1. **Отключите отображение ошибок:**
   В `api/config.php`:
   ```php
   error_reporting(0);
   ini_set('display_errors', 0);
   ```

2. **Измените секретный ключ:**
   ```php
   define('JWT_SECRET', 'your-very-secure-random-key-here');
   ```

3. **Ограничьте доступ к админ-панели:**
   - Используйте .htaccess для ограничения IP
   - Или настройте VPN доступ

4. **Настройте SSL (HTTPS):**
   - Обязательно используйте HTTPS для админ-панели
   - Настройте редирект с HTTP на HTTPS

5. **Регулярные обновления:**
   - Обновляйте PHP и MySQL
   - Делайте резервные копии БД

## Резервное копирование

### База данных:
```bash
mysqldump -u root -p samson_buket > backup_$(date +%Y%m%d).sql
```

### Файлы:
```bash
tar -czf backup_files_$(date +%Y%m%d).tar.gz .
```

## Устранение проблем

### Ошибка подключения к БД
- Проверьте настройки в `api/config.php`
- Убедитесь, что MySQL запущен
- Проверьте права пользователя БД

### 500 Internal Server Error
- Проверьте логи ошибок PHP
- Убедитесь, что все расширения PHP установлены
- Проверьте права доступа к файлам

### CORS ошибки
- Проверьте настройки в `api/.htaccess`
- Убедитесь, что заголовки CORS установлены

## Поддержка

При возникновении проблем проверьте:
1. Логи PHP: `/var/log/php/error.log`
2. Логи Apache/Nginx
3. Логи MySQL

---

**Готово!** Backend установлен и готов к работе. 🚀


