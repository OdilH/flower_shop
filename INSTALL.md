# Инструкция по запуску сайта Букеты & цветы

## 📋 Требования

- **PHP** 7.4 или выше
- **MySQL** 5.7 или выше (или MariaDB)
- **Apache** с модулем mod_rewrite (или Nginx)
- **Composer** (опционально, для зависимостей)

## 🚀 Быстрый старт

### Шаг 1: Клонирование/Копирование проекта

```bash
# Если проект в Git
git clone <repository-url>
cd samson

# Или просто скопируйте папку проекта в директорию веб-сервера
```

### Шаг 2: Настройка веб-сервера

#### Вариант A: Apache (рекомендуется)

1. Скопируйте проект в директорию Apache (например, `htdocs` или `www`):
   ```
   C:\xampp\htdocs\samson\
   или
   /var/www/html/samson/
   ```

2. Убедитесь, что включён модуль `mod_rewrite`:
   ```bash
   # В Linux
   sudo a2enmod rewrite
   sudo service apache2 restart
   ```

3. Настройте виртуальный хост (опционально):
   ```apache
   <VirtualHost *:80>
       ServerName samson.local
       DocumentRoot "C:/xampp/htdocs/samson"
       <Directory "C:/xampp/htdocs/samson">
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

#### Вариант B: Встроенный PHP сервер (для разработки)

```bash
cd d:\samson
php -S localhost:8000
```

Откройте в браузере: `http://localhost:8000`

### Шаг 3: Настройка базы данных

1. Создайте базу данных:
   ```sql
   CREATE DATABASE samson_buket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Импортируйте схему:
   ```bash
   # Через командную строку MySQL
   mysql -u root -p samson_buket < database/schema.sql
   
   # Или через phpMyAdmin:
   # - Откройте phpMyAdmin
   # - Выберите базу данных samson_buket
   # - Перейдите на вкладку "Импорт"
   # - Выберите файл database/schema.sql
   # - Нажмите "Вперёд"
   ```

3. Проверьте, что таблицы созданы:
   ```sql
   USE samson_buket;
   SHOW TABLES;
   ```

### Шаг 4: Настройка конфигурации

1. Откройте файл `api/config.php`

2. Обновите настройки подключения к БД:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');          // Ваш пользователь MySQL
   define('DB_PASS', '');              // Ваш пароль MySQL
   define('DB_NAME', 'samson_buket');  // Имя базы данных
   ```

3. Настройте email для уведомлений:
   ```php
   define('ADMIN_EMAIL', 'admin@samson-buket.ru');
   ```

4. Настройте доставку (опционально):
   ```php
   define('DELIVERY_THRESHOLD', 5000);  // Бесплатная доставка от суммы
   define('DELIVERY_COST', 500);         // Стоимость доставки
   ```

### Шаг 5: Проверка прав доступа

Убедитесь, что папки имеют правильные права на запись (для Linux):
```bash
chmod 755 api/
chmod 644 api/*.php
```

### Шаг 6: Запуск проекта

1. Запустите веб-сервер (Apache/Nginx или встроенный PHP сервер)

2. Откройте в браузере:
   ```
   http://localhost/samson/
   или
   http://samson.local/
   или
   http://localhost:8000/
   ```

3. Проверьте работу API:
   ```
   http://localhost/samson/api/products.php
   ```

## 🔧 Дополнительная настройка

### Настройка .htaccess

Файл `api/.htaccess` уже настроен для работы с API. Если возникают проблемы:

1. Убедитесь, что `AllowOverride All` включён в конфигурации Apache
2. Проверьте, что модуль `mod_rewrite` активен

### Настройка CORS (если нужно)

Если фронтенд и бэкенд на разных доменах, добавьте в `api/db.php`:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

### Настройка email (для отправки уведомлений)

В файле `api/orders.php` и `api/contact.php` используется функция `mail()`. Для работы:

1. **Windows (XAMPP)**: Настройте SMTP в `php.ini`:
   ```ini
   [mail function]
   SMTP = smtp.gmail.com
   smtp_port = 587
   sendmail_from = your-email@gmail.com
   ```

2. **Linux**: Установите и настройте sendmail или используйте PHPMailer

3. **Рекомендуется**: Использовать PHPMailer для надёжной отправки:
   ```bash
   composer require phpmailer/phpmailer
   ```

## 📝 Тестовые данные

После импорта схемы в базе данных уже есть:
- ✅ Категории товаров
- ✅ Примеры товаров (12 шт)
- ✅ Администратор (логин: `admin`, пароль: `admin123`)

**ВНИМАНИЕ**: Смените пароль администратора после первого входа!

## 🐛 Решение проблем

### Ошибка подключения к БД

1. Проверьте настройки в `api/config.php`
2. Убедитесь, что MySQL запущен
3. Проверьте права пользователя БД

### API не работает

1. Проверьте, что файлы в папке `api/` доступны
2. Проверьте логи Apache/PHP на ошибки
3. Убедитесь, что `.htaccess` работает

### Изображения не загружаются

1. Проверьте пути к изображениям в HTML/JS
2. Убедитесь, что папка `assets/img/` существует
3. Проверьте права доступа к файлам

### Проблемы с сессиями

1. Проверьте права на папку сессий PHP
2. Убедитесь, что `session_start()` вызывается до вывода

## 🔐 Безопасность

### Перед запуском в продакшн:

1. ✅ Измените пароль администратора
2. ✅ Настройте безопасные пароли для БД
3. ✅ Включите HTTPS
4. ✅ Настройте firewall
5. ✅ Регулярно обновляйте зависимости
6. ✅ Делайте резервные копии БД

## 📦 Структура проекта

```
samson/
├── index.html              # Главная страница
├── catalog.html            # Каталог
├── product.html           # Страница товара
├── cart.html              # Корзина
├── favorites.html         # Избранное
├── about.html             # О компании
├── contacts.html          # Контакты
├── delivery.html          # Доставка
├── assets/                # Статические файлы
│   ├── css/              # Стили
│   ├── js/               # JavaScript
│   └── img/              # Изображения
├── api/                   # Backend API
│   ├── config.php        # Конфигурация
│   ├── db.php            # Подключение к БД
│   ├── products.php      # API товаров
│   ├── orders.php        # API заказов
│   └── ...
├── database/
│   └── schema.sql        # Схема БД
├── admin/                # Админ-панель
└── README.md             # Документация
```

## 🎯 Следующие шаги

1. Замените placeholder изображения на реальные фотографии
2. Настройте отправку email через SMTP
3. Добавьте реальные товары в базу данных
4. Настройте SEO (мета-теги, sitemap.xml)
5. Протестируйте все функции сайта

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Проверьте консоль браузера (F12)
3. Убедитесь, что все требования выполнены

---

**Успешного запуска! 🌹**


