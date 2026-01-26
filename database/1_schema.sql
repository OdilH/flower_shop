-- ============================================
-- Цветикс - СХЕМА БАЗЫ ДАННЫХ
-- ============================================

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS samson_buket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE samson_buket;

-- Таблица: categories (категории товаров)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: products (товары)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    old_price DECIMAL(10, 2) NULL,
    image VARCHAR(255),
    images TEXT, -- JSON массив дополнительных изображений
    category_id INT,
    in_stock BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    badge VARCHAR(50) NULL, -- 'Хит', 'Новинка', 'Акция'
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: orders (заказы)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    delivery_address TEXT,
    delivery_date DATE NULL,
    delivery_time VARCHAR(50) NULL,
    comment TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_cost DECIMAL(10, 2) DEFAULT 0,
    status ENUM('new', 'processing', 'confirmed', 'delivering', 'completed', 'cancelled') DEFAULT 'new',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: order_items (товары в заказе)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(255) NOT NULL, -- Сохраняем название на момент заказа
    product_price DECIMAL(10, 2) NOT NULL, -- Сохраняем цену на момент заказа
    quantity INT DEFAULT 1 NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: reviews (отзывы)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    product_id INT NULL, -- Если отзыв о конкретном товаре
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_approved (approved),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: contacts (сообщения из формы обратной связи)
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: users (пользователи для админ-панели)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('admin', 'manager') DEFAULT 'manager',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица: settings (настройки сайта)
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) UNIQUE NOT NULL,
    `value` TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ВСТАВКА НАЧАЛЬНЫХ ДАННЫХ
-- ============================================

-- Категории (на основе sitemap samson-buket.ru)
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Букеты', 'bukety', 'Классические букеты из различных цветов', 1),
('Цветы в корзине', 'korziny', 'Цветочные композиции в плетеных корзинах', 2),
('Шляпные коробки', 'shlap-korob', 'Цветы в шляпных коробках', 3),
('Flower Box', 'flower-box', 'Цветы в стильных боксах', 4),
('Композиции', 'kompozicii', 'Авторские флористические композиции', 5),
('Exclusive', 'exclusive', 'Эксклюзивные букеты премиум класса', 6),
('Свадьба', 'wedding', 'Свадебная флористика', 7),
('Бутоньерки', 'butonerka', 'Свадебные бутоньерки', 8),
('Букет дня', 'buket-day', 'Специальное предложение дня', 9),
('Новый год', 'novyy-god', 'Новогодние композиции', 10),
('Пасхальные букеты', 'pashal-nye-bukety', 'Букеты к Пасхе', 11),
('Горшечные растения', 'gorshechnye-rasteniya', 'Растения в горшках', 12),
('Аромадиффузоры', 'aroma-diff', 'Ароматические диффузоры', 13),
('Открытки', 'postcard', 'Дизайнерские открытки', 14),
('Текстиль', 'textile', 'Текстильные изделия', 15),
('В вазе', 'vaza', 'Композиции в вазах', 16);

-- Таблица типов цветов (для фильтрации)
CREATE TABLE IF NOT EXISTS flower_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(255),
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Типы цветов (на основе sitemap)
INSERT INTO flower_types (name, slug, sort_order) VALUES
('Розы', 'roza', 1),
('Тюльпаны', 'tyul-pan', 2),
('Пионы', 'pion', 3),
('Лилии', 'liliya', 4),
('Ирисы', 'iris', 5),
('Гвоздики', 'gvozdika', 6),
('Хризантемы', 'hrizantema-onehead', 7),
('Альстромерии', 'al-stromeriya', 8),
('Эустома', 'eustoma', 9),
('Фрезии', 'freziya', 10),
('Ранункулюсы', 'ranunkulyus', 11),
('Гортензии', 'gortenziya', 12),
('Нарциссы', 'narciss', 13),
('Гиацинты', 'giacint', 14),
('Ландыши', 'landysh', 15),
('Астры', 'astra', 16),
('Георгины', 'georgin', 17),
('Герберы', 'gerbera', 18),
('Лаванда', 'lavanda', 19),
('Подсолнухи', 'podsolnuh', 20);

-- Связь товаров и типов цветов (многие ко многим)
CREATE TABLE IF NOT EXISTS product_flowers (
    product_id INT NOT NULL,
    flower_type_id INT NOT NULL,
    PRIMARY KEY (product_id, flower_type_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (flower_type_id) REFERENCES flower_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Примеры товаров (обновленные категории)
INSERT INTO products (name, slug, description, short_description, price, category_id, in_stock, is_popular, is_new, badge, image) VALUES
('Букет из 25 красных роз', 'bouquet-25-red-roses', 'Роскошный букет из 25 красных роз премиум класса. Идеальный подарок для выражения чувств.', 'Красные розы премиум класса', 5000.00, 1, TRUE, TRUE, FALSE, 'Хит', 'assets/img/products/product-1.png'),
('Букет тюльпанов', 'bouquet-tulips', 'Яркий весенний букет из свежих тюльпанов различных оттенков.', 'Яркие весенние тюльпаны', 3600.00, 1, TRUE, FALSE, TRUE, 'Новинка', 'assets/img/products/product-2.png'),
('Свадебный букет невесты', 'wedding-bouquet-white', 'Нежный белый свадебный букет из роз и эустомы. Создан специально для невесты.', 'Нежный белый букет для невесты', 7000.00, 7, TRUE, TRUE, FALSE, NULL, 'assets/img/products/product-3.png'),
('Композиция в корзине', 'composition-basket', 'Смешанный букет в плетеной корзине. Идеально для подарка или украшения интерьера.', 'Смешанный букет в плетеной корзине', 4400.00, 2, TRUE, FALSE, FALSE, NULL, 'assets/img/products/product-4.png'),
('Букет из пионов', 'bouquet-peonies', 'Пышный букет из нежных пионов. Символ роскоши и изящества.', 'Нежные пионы', 6400.00, 1, TRUE, TRUE, FALSE, 'Хит', 'assets/img/products/product-5.png'),
('Эксклюзивный букет', 'exclusive-bouquet', 'Авторская композиция от чемпионов России по флористике. Уникальный дизайн.', 'Авторская композиция', 9000.00, 6, TRUE, FALSE, TRUE, 'Exclusive', 'assets/img/products/product-6.png'),
('Flower Box Нежность', 'flower-box-tenderness', 'Цветочная композиция в стильном боксе. Идеальный подарок.', 'Стильный flower box', 5600.00, 4, TRUE, FALSE, TRUE, 'Новинка', 'assets/img/products/product-1.png'),
('Корзина с гортензиями', 'basket-hydrangeas', 'Пышная корзина с нежными гортензиями и розами.', 'Гортензии в корзине', 7600.00, 2, TRUE, TRUE, FALSE, 'Хит', 'assets/img/products/product-2.png'),
('Букет с лилиями', 'bouquet-lilies', 'Элегантный букет с ароматными лилиями.', 'Ароматные лилии', 5400.00, 1, TRUE, FALSE, FALSE, NULL, 'assets/img/products/product-3.png'),
('Шляпная коробка Premium', 'hat-box-premium', 'Роскошные цветы в шляпной коробке премиум класса.', 'Premium flower box', 8400.00, 3, TRUE, TRUE, FALSE, 'Premium', 'assets/img/products/product-4.png'),
('Букет из эустомы', 'bouquet-eustoma', 'Нежный букет из воздушной эустомы.', 'Нежная эустома', 4600.00, 1, TRUE, FALSE, TRUE, 'Новинка', 'assets/img/products/product-5.png'),
('Композиция в вазе', 'composition-vase', 'Авторская композиция в дизайнерской вазе.', 'Интерьерная композиция', 6200.00, 5, TRUE, FALSE, FALSE, NULL, 'assets/img/products/product-6.png');

-- Связи товаров с типами цветов
INSERT INTO product_flowers (product_id, flower_type_id) VALUES
(1, 1),   -- Букет роз - розы
(2, 2),   -- Букет тюльпанов - тюльпаны
(3, 1),   -- Свадебный букет - розы
(3, 9),   -- Свадебный букет - эустома
(4, 1),   -- Композиция в корзине - розы
(4, 12),  -- Композиция в корзине - гортензии
(5, 3),   -- Букет из пионов - пионы
(6, 1),   -- Эксклюзивный букет - розы
(6, 3),   -- Эксклюзивный букет - пионы
(6, 11),  -- Эксклюзивный букет - ранункулюсы
(7, 1),   -- Flower Box - розы
(8, 12),  -- Корзина с гортензиями - гортензии
(8, 1),   -- Корзина с гортензиями - розы
(9, 4),   -- Букет с лилиями - лилии
(10, 1),  -- Шляпная коробка - розы
(10, 3),  -- Шляпная коробка - пионы
(11, 9),  -- Букет из эустомы - эустома
(12, 1),  -- Композиция в вазе - розы
(12, 12), -- Композиция в вазе - гортензии
(12, 9);  -- Композиция в вазе - эустома

-- Настройки сайта
INSERT INTO settings (`key`, `value`, description) VALUES
('site_name', 'Цветикс', 'Название сайта'),
('site_email', 'l1m12345612@gmail.com', 'Email для уведомлений'),
('site_phone', '+79252944432', 'Телефон для связи'),
('delivery_cost', '500', 'Стоимость доставки'),
('free_delivery_threshold', '3000', 'Порог для бесплатной доставки'),
('working_hours', '9:00 - 21:00', 'Часы работы');

-- Создание администратора (пароль: admin123 - в продакшене нужно изменить!)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'l1m12345612@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Администратор', 'admin');
-- Пароль по умолчанию: admin123 (в продакшене ОБЯЗАТЕЛЬНО изменить!)

-- Примеры отзывов
INSERT INTO reviews (customer_name, rating, comment, approved) VALUES
('Анна М.', 5, 'Потрясающий букет! Цветы были свежие, доставка быстрая. Очень довольна!', TRUE),
('Мария К.', 5, 'Заказывала свадебный букет. Превзошли все ожидания! Спасибо за красоту!', TRUE),
('Елена В.', 5, 'Регулярно заказываю букеты. Всегда свежие цветы и отличный сервис!', TRUE);


