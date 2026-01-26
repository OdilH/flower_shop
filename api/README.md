# API ДОКУМЕНТАЦИЯ - Цветикс

## Базовый URL
```
http://your-domain.ru/api/
```

## Endpoints

### 1. Товары

#### Получить список товаров
```
GET /api/products.php
```

**Параметры:**
- `category` (int) - ID категории
- `category_slug` (string) - Slug категории
- `search` (string) - Поисковый запрос
- `popular` (int) - 1 для популярных товаров
- `new` (int) - 1 для новинок
- `limit` (int) - Количество товаров
- `offset` (int) - Смещение для пагинации

**Пример:**
```
GET /api/products.php?category=1&popular=1&limit=10
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Букет из 25 роз",
      "slug": "bouquet-25-red-roses",
      "description": "...",
      "price": 2500.00,
      "image": "assets/img/products/product-1.jpg",
      "category_id": 1,
      "in_stock": true,
      "is_popular": true
    }
  ],
  "total": 10,
  "limit": 10,
  "offset": 0
}
```

#### Получить один товар
```
GET /api/product.php?id=1
GET /api/product.php?slug=bouquet-25-red-roses
```

---

### 2. Категории

#### Получить список категорий
```
GET /api/categories.php
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Букеты",
      "slug": "bouquets",
      "products_count": 15
    }
  ]
}
```

---

### 3. Заказы

#### Создать заказ
```
POST /api/orders.php
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "customer_name": "Иван Иванов",
  "customer_phone": "+79991234567",
  "customer_email": "ivan@example.com",
  "delivery_address": "Москва, ул. Ленина, д. 1",
  "delivery_date": "2024-12-01",
  "delivery_time": "14:00",
  "comment": "Комментарий к заказу",
  "payment_method": "cash",
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

**Ответ:**
```json
{
  "success": true,
  "order_id": 1,
  "order_number": "SB-20241129-0001",
  "total_amount": 3000.00
}
```

#### Получить информацию о заказе
```
GET /api/orders.php?id=1
GET /api/orders.php?number=SB-20241129-0001
```

---

### 4. Форма обратной связи

#### Отправить сообщение
```
POST /api/contact.php
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+79991234567",
  "subject": "Вопрос",
  "message": "Текст сообщения"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Сообщение успешно отправлено",
  "contact_id": 1
}
```

---

### 5. Отзывы

#### Получить отзывы
```
GET /api/reviews.php?product_id=1&approved=1&limit=10
```

#### Создать отзыв
```
POST /api/reviews.php
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "customer_name": "Анна М.",
  "customer_email": "anna@example.com",
  "rating": 5,
  "comment": "Отличный букет!",
  "product_id": 1
}
```

---

## Коды ответов

- `200` - Успешно
- `400` - Ошибка валидации
- `404` - Не найдено
- `405` - Метод не поддерживается
- `500` - Внутренняя ошибка сервера

## Формат ответа при ошибке

```json
{
  "success": false,
  "error": "Описание ошибки",
  "message": "Детальное сообщение (только в режиме разработки)"
}
```

## Безопасность

- Все запросы используют prepared statements для защиты от SQL-инъекций
- Валидация всех входящих данных
- Экранирование специальных символов
- CORS настроен для работы с фронтендом

## Настройка

Перед использованием измените настройки в `api/config.php`:
- Данные подключения к БД
- Email для уведомлений
- Стоимость доставки
- Порог бесплатной доставки


