# Настройка HTTPS для cvekety.ru

Это руководство описывает настройку HTTPS с использованием бесплатного SSL сертификата от Let's Encrypt.

---

## Предварительные требования

- Доступ к серверу по SSH
- Домен cvekety.ru указывает на IP сервера
- Установлен Nginx или Apache
- Права root или sudo

---

## Вариант 1: Автоматическая настройка с Certbot (рекомендуется)

### Шаг 1: Установка Certbot

**Для Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

**Для CentOS/RHEL:**
```bash
sudo yum install certbot python3-certbot-nginx
```

### Шаг 2: Получение сертификата

```bash
sudo certbot --nginx -d cvekety.ru -d www.cvekety.ru
```

Certbot автоматически:
- Получит сертификат
- Настроит Nginx
- Настроит автоматическое перенаправление HTTP → HTTPS

### Шаг 3: Проверка автообновления

```bash
sudo certbot renew --dry-run
```

---

## Вариант 2: Ручная настройка Nginx

### Шаг 1: Получение сертификата

```bash
sudo certbot certonly --webroot -w /var/www/html -d cvekety.ru -d www.cvekety.ru
```

### Шаг 2: Настройка Nginx

Создайте/обновите конфигурацию `/etc/nginx/sites-available/cvekety.ru`:

```nginx
# Перенаправление HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name cvekety.ru www.cvekety.ru;
    
    # Для обновления сертификата
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Перенаправление на HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS сервер
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cvekety.ru www.cvekety.ru;
    
    root /var/www/cvekety.ru;
    index index.html index.php;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/cvekety.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cvekety.ru/privkey.pem;
    
    # SSL параметры (рекомендуемые)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS (раскомментируйте после тестирования)
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Дополнительные заголовки безопасности
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # PHP обработка
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param HTTPS on;
    }
    
    # Статические файлы
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Шаг 3: Применение конфигурации

```bash
# Проверка синтаксиса
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl reload nginx
```

---

## Шаг 4: Настройка автоматического обновления

Добавьте в crontab:
```bash
sudo crontab -e
```

Добавьте строку:
```
0 0 * * * certbot renew --quiet && systemctl reload nginx
```

---

## Вариант 3: С использованием Cloudflare (если используется)

Если вы используете Cloudflare:

1. **В панели Cloudflare:**
   - SSL/TLS → Overview → Режим: "Full (Strict)"
   - Edge Certificates → Always Use HTTPS: ON
   - Edge Certificates → Automatic HTTPS Rewrites: ON

2. **На сервере:** Установите Origin Certificate от Cloudflare
   ```bash
   # Скопируйте сертификат из Cloudflare в:
   /etc/ssl/certs/cloudflare-origin.pem
   /etc/ssl/private/cloudflare-origin.key
   ```

3. **Обновите Nginx конфигурацию:**
   ```nginx
   ssl_certificate /etc/ssl/certs/cloudflare-origin.pem;
   ssl_certificate_key /etc/ssl/private/cloudflare-origin.key;
   ```

---

## Проверка настройки

### 1. Проверка сертификата онлайн:
- https://www.ssllabs.com/ssltest/analyze.html?d=cvekety.ru

### 2. Проверка перенаправления:
```bash
curl -I http://cvekety.ru
# Должно быть: Location: https://cvekety.ru/
```

### 3. Проверка HTTPS:
```bash
curl -I https://cvekety.ru
# Должно быть: HTTP/2 200
```

---

## Обновление приложения для HTTPS

### В config.php добавьте:

```php
// Проверка HTTPS
if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
    if (php_sapi_name() !== 'cli') {
        header("Location: https://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
        exit();
    }
}

// Установка secure cookies
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Strict');
```

---

## Troubleshooting

### Проблема: "Certificate not yet valid"
**Решение:** Проверьте время сервера: `date`

### Проблема: "Connection refused"
**Решение:** Проверьте firewall:
```bash
sudo ufw allow 443/tcp
sudo ufw status
```

### Проблема: Mixed content warnings
**Решение:** Обновите все ссылки на HTTPS в HTML/JS файлах

---

## Мониторинг

Настройте мониторинг срока действия сертификата:
```bash
# Проверка срока действия
echo | openssl s_client -connect cvekety.ru:443 2>/dev/null | openssl x509 -noout -dates
```

Сертификаты Let's Encrypt действуют 90 дней и автоматически обновляются при правильной настройке.
