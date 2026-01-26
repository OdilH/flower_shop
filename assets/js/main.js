/**
 * Цветикс - ОСНОВНОЙ JAVASCRIPT
 */

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function () {

    // Инициализация всех модулей
    initMobileMenu();
    initSmoothScroll();
    initAnimations();
    initCart();
    initCookieBanner();

    console.log('Цветикс - сайт загружен');
});

/**
 * Боковое меню (Sidebar)
 */
function initMobileMenu() {
    const burgerBtn = document.getElementById('burgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const body = document.body;

    // Функция открытия sidebar
    function openSidebar() {
        sidebar.classList.add('active');
        body.classList.add('sidebar-open');
    }

    // Функция закрытия sidebar
    function closeSidebar() {
        sidebar.classList.remove('active');
        body.classList.remove('sidebar-open');
    }

    // Открытие по клику на бургер
    if (burgerBtn) {
        burgerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            openSidebar();
        });
    }

    // Закрытие по клику на крестик
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    // Закрытие по клику на overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Закрытие по клавише Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });

    // Закрытие при клике на ссылку в sidebar
    if (sidebar) {
        const menuLinks = sidebar.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function () {
                setTimeout(closeSidebar, 100);
            });
        });
    }
}

/**
 * Плавная прокрутка к якорям
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Пропускаем пустые якоря
            if (href === '#' || href === '') {
                return;
            }

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Анимации при скролле (AOS будет подключен отдельно)
 */
function initAnimations() {
    // Простая проверка видимости элементов
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами с классом .animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Инициализация корзины
 */
function initCart() {
    // Проверяем наличие корзины в localStorage
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    updateCartCount();
}

/**
 * Обновление счетчика корзины
 */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.querySelector('.cart-count');

    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;

        // Показываем/скрываем счетчик
        if (totalItems > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    }
}

/**
 * Добавление товара в корзину
 */
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Проверяем, есть ли уже такой товар
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Показываем уведомление
    showNotification('Товар добавлен в корзину!');
}

/**
 * Показ уведомления
 */
function showNotification(message, type = 'success') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Cookie Banner
 * Показывает баннер согласия на использование cookies на всех страницах
 */
function initCookieBanner() {
    // Если уже приняли cookies - не показываем
    if (localStorage.getItem('cookiesAccepted')) {
        return;
    }

    // Проверяем, что баннер еще не существует
    if (document.getElementById('cookieBanner')) {
        const existingBanner = document.getElementById('cookieBanner');
        existingBanner.classList.add('active');
        return;
    }

    // Создаем HTML баннера
    const bannerHTML = `
        <div class="cookie-banner" id="cookieBanner">
            <div class="cookie-banner__content">
                <div class="cookie-banner__text">
                    <p>Мы используем файлы cookie для улучшения работы сайта и анализа трафика. 
                       Продолжая использовать сайт, вы соглашаетесь с 
                       <a href="privacy.html">Политикой конфиденциальности</a> и обработкой персональных данных.</p>
                </div>
                <div class="cookie-banner__actions">
                    <button class="cookie-banner__btn cookie-banner__btn--accept" id="cookieAccept">Принять</button>
                    <button class="cookie-banner__btn cookie-banner__btn--more" onclick="window.location.href='privacy.html'">Подробнее</button>
                </div>
            </div>
        </div>
    `;

    // Добавляем баннер в body
    document.body.insertAdjacentHTML('beforeend', bannerHTML);

    // Показываем баннер с небольшой задержкой для анимации
    setTimeout(function () {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.add('active');
        }
    }, 500);

    // Обработчик кнопки "Принять"
    const acceptBtn = document.getElementById('cookieAccept');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function () {
            localStorage.setItem('cookiesAccepted', 'true');
            localStorage.setItem('cookiesAcceptedDate', new Date().toISOString());
            const banner = document.getElementById('cookieBanner');
            if (banner) {
                banner.classList.remove('active');
            }
        });
    }
}

// Экспортируем функции для использования в других файлах
window.SamsonBuket = {
    addToCart,
    updateCartCount,
    showNotification
};

