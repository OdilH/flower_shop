# 🚀 Быстрый запуск - Цветикс

## Для Windows (XAMPP)

### 1. Установите XAMPP
Скачайте и установите [XAMPP](https://www.apachefriends.org/)

### 2. Скопируйте проект
```
C:\xampp\htdocs\samson\
```

### 3. Запустите Apache и MySQL
В панели управления XAMPP нажмите "Start" для Apache и MySQL

### 4. Создайте базу данных
1. Откройте http://localhost/phpmyadmin
2. Создайте БД: `samson_buket`
3. Импортируйте файл: `database/schema.sql`

### 5. Настройте config.php
Откройте `api/config.php` и укажите:
```php
DB_USER = 'root'
DB_PASS = ''  // Обычно пустой для XAMPP
```

### 6. Откройте сайт
```
http://localhost/samson/
```

---

## Для Linux (Ubuntu/Debian)

### 1. Установите зависимости
```bash
sudo apt update
sudo apt install apache2 mysql-server php php-mysql
```

### 2. Скопируйте проект
```bash
sudo cp -r samson /var/www/html/
sudo chown -R www-data:www-data /var/www/html/samson
```

### 3. Создайте базу данных
```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE samson_buket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Импортируйте схему
```bash
sudo mysql -u root -p samson_buket < database/schema.sql
```

### 5. Настройте config.php
```bash
sudo nano /var/www/html/samson/api/config.php
```

### 6. Включите mod_rewrite
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 7. Откройте сайт
```
http://localhost/samson/
```

---

## Для разработки (встроенный PHP сервер)

### 1. Перейдите в папку проекта
```bash
cd d:\samson
```

### 2. Запустите сервер
```bash
php -S localhost:8000
```

### 3. Откройте в браузере
```
http://localhost:8000
```

**Примечание**: Для работы с БД всё равно нужен MySQL!

---

## Минимальная проверка

После запуска проверьте:

1. ✅ Главная страница открывается
2. ✅ Каталог загружается
3. ✅ API работает: `http://localhost/samson/api/products.php`
4. ✅ База данных подключена (нет ошибок в консоли)

---

## Быстрая настройка БД (phpMyAdmin)

1. Откройте http://localhost/phpmyadmin
2. Создайте новую БД: `samson_buket`
3. Выберите БД → Импорт → Выберите `database/schema.sql` → Вперёд

Готово! 🎉


