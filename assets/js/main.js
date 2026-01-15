/**
 * Букеты & цветы - ОСНОВНОЙ JAVASCRIPT
 */

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    
    // Инициализация всех модулей
    initMobileMenu();
    initSmoothScroll();
    initAnimations();
    initCart();
    
    console.log('Букеты & цветы - сайт загружен');
});

/**
 * Мобильное меню (бургер)
 */
function initMobileMenu() {
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.header__nav');
    const body = document.body;
    
    if (burger && menu) {
        burger.addEventListener('click', function() {
            burger.classList.toggle('active');
            menu.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
        
        // Закрытие меню при клике на ссылку
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                burger.classList.remove('active');
                menu.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (!menu.contains(e.target) && !burger.contains(e.target)) {
                burger.classList.remove('active');
                menu.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    }
}

/**
 * Плавная прокрутка к якорям
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
    
    const observer = new IntersectionObserver(function(entries) {
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

// Экспортируем функции для использования в других файлах
window.SamsonBuket = {
    addToCart,
    updateCartCount,
    showNotification
};


