/**
 * Личный кабинет - JavaScript (с интеграцией API)
 */

const API_URL = 'api';

document.addEventListener('DOMContentLoaded', function () {
    // Проверяем авторизацию
    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    initAccountTabs();
    initLogout();
    loadUserData();
    loadOrders();
    loadAddresses();
    loadFavorites();
    initProfileForm();
});

/**
 * Загрузка данных пользователя
 */
async function loadUserData() {
    try {
        // ИСПРАВЛЕНО: токен в Authorization header
        const response = await fetch(`${API_URL}/auth.php?action=me`, {
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            }
        });
        const data = await response.json();

        if (data.success) {
            const user = data.user;

            // Обновляем сайдбар
            const avatarInitials = (user.first_name[0] || '') + (user.last_name?.[0] || '');
            document.querySelector('.account-user__avatar span').textContent = avatarInitials.toUpperCase();
            document.querySelector('.account-user__name').textContent = `${user.first_name} ${user.last_name || ''}`.trim();
            document.querySelector('.account-user__email').textContent = user.email;

            // Обновляем форму профиля
            document.getElementById('firstName').value = user.first_name || '';
            document.getElementById('lastName').value = user.last_name || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('email').value = user.email || '';
            if (user.birthday) {
                document.getElementById('birthday').value = user.birthday;
            }
        } else if (!data.success && response.status === 401) {
            Auth.logout();
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

/**
 * Загрузка заказов
 */
async function loadOrders() {
    try {
        // ИСПРАВЛЕНО: токен в Authorization header
        const response = await fetch(`${API_URL}/customers.php?action=orders`, {
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            }
        });
        const data = await response.json();

        if (data.success) {
            renderOrders(data.data);
        }
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
    }
}

/**
 * Отрисовка заказов
 */
function renderOrders(orders) {
    const container = document.querySelector('.orders-list');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">📦</div>
                <h3>У вас пока нет заказов</h3>
                <p>Перейдите в каталог, чтобы выбрать цветы</p>
                <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => {
        const statusClass = {
            'new': 'processing',
            'processing': 'processing',
            'confirmed': 'processing',
            'delivering': 'processing',
            'completed': 'delivered',
            'cancelled': 'cancelled'
        }[order.status] || 'processing';

        const itemsHtml = order.items.map(item => `
            <div class="order-item">
                <img src="${item.image || 'assets/img/products/product-1.png'}" alt="${item.product_name}">
                <div class="order-item__info">
                    <h4>${item.product_name}</h4>
                    <span>${item.quantity} шт × ${formatPrice(item.product_price)}</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="order-card">
                <div class="order-card__header">
                    <div class="order-card__info">
                        <span class="order-card__number">Заказ #${order.order_number}</span>
                        <span class="order-card__date">${formatDate(order.created_at)}</span>
                    </div>
                    <div class="order-card__status order-card__status--${statusClass}">
                        ${order.status_text}
                    </div>
                </div>
                <div class="order-card__body">
                    <div class="order-card__items">
                        ${itemsHtml}
                    </div>
                    <div class="order-card__summary">
                        <div class="order-card__total">
                            <span>Итого:</span>
                            <strong>${formatPrice(order.total_amount)}</strong>
                        </div>
                        <div class="order-card__actions">
                            <button class="btn btn-outline btn-sm" onclick="repeatOrder(${order.id})">Повторить заказ</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Загрузка адресов
 */
async function loadAddresses() {
    try {
        // ИСПРАВЛЕНО: токен в Authorization header
        const response = await fetch(`${API_URL}/addresses.php`, {
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            }
        });
        const data = await response.json();

        if (data.success) {
            renderAddresses(data.data);
        }
    } catch (error) {
        console.error('Ошибка загрузки адресов:', error);
    }
}

/**
 * Отрисовка адресов
 */
function renderAddresses(addresses) {
    const container = document.querySelector('.addresses-list');
    if (!container) return;

    if (addresses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">📍</div>
                <h3>Нет сохраненных адресов</h3>
                <p>Добавьте адрес для быстрого оформления заказов</p>
            </div>
        `;
        return;
    }

    container.innerHTML = addresses.map(addr => `
        <div class="address-card ${addr.is_default == 1 ? 'address-card--default' : ''}">
            ${addr.is_default == 1 ? '<div class="address-card__badge">Основной</div>' : ''}
            <div class="address-card__content">
                <h4>${addr.title}</h4>
                <p>${addr.address}</p>
                <span class="address-card__phone">${addr.phone || ''}</span>
            </div>
            <div class="address-card__actions">
                ${addr.is_default != 1 ? `
                    <button class="btn-icon" title="Сделать основным" onclick="setDefaultAddress(${addr.id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </button>
                ` : ''}
                <button class="btn-icon btn-icon--danger" title="Удалить" onclick="deleteAddress(${addr.id})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Загрузка избранного
 */
async function loadFavorites() {
    try {
        // ИСПРАВЛЕНО: токен в Authorization header
        const response = await fetch(`${API_URL}/favorites.php`, {
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            }
        });
        const data = await response.json();

        if (data.success) {
            renderFavorites(data.data);
        }
    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
    }
}

/**
 * Отрисовка избранного
 */
function renderFavorites(favorites) {
    const container = document.querySelector('.favorites-grid');
    if (!container) return;

    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state__icon">❤️</div>
                <h3>Нет избранных товаров</h3>
                <p>Добавляйте товары в избранное, нажимая на сердечко</p>
                <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    container.innerHTML = favorites.map(product => `
        <div class="product-card">
            <div class="product-card__image">
                <a href="product.html?id=${product.id}">
                    <img src="${product.image || 'assets/img/products/product-1.png'}" alt="${product.name}">
                </a>
                <button class="product-card__favorite active" onclick="removeFavorite(${product.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="product-card__content">
                <h3 class="product-card__title">${product.name}</h3>
                <div class="product-card__price">${formatPrice(product.price)}</div>
                <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})">В корзину</button>
            </div>
        </div>
    `).join('');
}

/**
 * Удалить из избранного
 */
async function removeFavorite(productId) {
    try {
        // ИСПРАВЛЕНО: токен в Authorization header
        const response = await fetch(`${API_URL}/favorites.php?product_id=${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            }
        });
        const data = await response.json();

        if (data.success) {
            loadFavorites();
            showNotification('Удалено из избранного', 'success');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

/**
 * Установить адрес по умолчанию
 */
async function setDefaultAddress(id) {
    try {
        // ИСПРАВЛЕНО: токен в Authorization header
        const response = await fetch(`${API_URL}/addresses.php?action=set_default&id=${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            }
        });
        const data = await response.json();

        if (data.success) {
            loadAddresses();
            showNotification('Адрес установлен как основной', 'success');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

/**
 * Удалить адрес
 */
async function deleteAddress(id) {
    if (!confirm('Удалить этот адрес?')) return;

    try {
        // ИСПРАВЛЕНО: токен в Authorization header
        const response = await fetch(`${API_URL}/addresses.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            }
        });
        const data = await response.json();

        if (data.success) {
            loadAddresses();
            showNotification('Адрес удален', 'success');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

/**
 * Инициализация переключения вкладок
 */
function initAccountTabs() {
    const menuItems = document.querySelectorAll('.account-menu__item[data-tab]');
    const tabs = document.querySelectorAll('.account-tab');

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            const tabId = this.getAttribute('data-tab');

            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');

            tabs.forEach(tab => tab.classList.remove('active'));

            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                activeTab.classList.add('active');
            }

            history.pushState(null, '', '#' + tabId);
        });
    });

    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetMenuItem = document.querySelector(`.account-menu__item[data-tab="${hash}"]`);
        if (targetMenuItem) {
            targetMenuItem.click();
        }
    }
}

/**
 * Форма профиля
 */
function initProfileForm() {
    const form = document.querySelector('.profile-form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const data = {
                first_name: document.getElementById('firstName').value,
                last_name: document.getElementById('lastName').value,
                phone: document.getElementById('phone').value,
                birthday: document.getElementById('birthday').value
            };

            try {
                // ИСПРАВЛЕНО: токен в Authorization header
                const response = await fetch(`${API_URL}/customers.php?action=profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Auth.getToken()}`
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.success) {
                    showNotification('Профиль сохранен', 'success');
                    loadUserData();
                } else {
                    showNotification(result.error || 'Ошибка сохранения', 'error');
                }
            } catch (error) {
                showNotification('Ошибка соединения', 'error');
            }
        });
    }
}

/**
 * Выход из аккаунта
 */
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            if (confirm('Вы уверены, что хотите выйти?')) {
                try {
                    // ИСПРАВЛЕНО: токен в Authorization header
                    await fetch(`${API_URL}/auth.php?action=logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${Auth.getToken()}`
                        }
                    });
                } catch (error) {
                    console.log('Logout error:', error);
                }

                Auth.logout();
                window.location.href = 'login.html';
            }
        });
    }
}

/**
 * Вспомогательные функции
 */
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <span class="notification__message">${message}</span>
        <button class="notification__close">&times;</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    notification.querySelector('.notification__close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Стили для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 45px 15px 20px;
        background: #333;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 9999;
    }
    .notification.show { transform: translateX(0); }
    .notification--success { background: #28a745; }
    .notification--error { background: #dc3545; }
    .notification__close {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0.7;
    }
    .notification__close:hover { opacity: 1; }
    .empty-state {
        text-align: center;
        padding: 40px 20px;
        background: #f8f9fa;
        border-radius: 12px;
    }
    .empty-state__icon { font-size: 3rem; margin-bottom: 15px; }
    .empty-state h3 { margin-bottom: 10px; }
    .empty-state p { color: #666; margin-bottom: 20px; }
`;
document.head.appendChild(notificationStyles);

// Добавляем Auth класс если еще не загружен
if (typeof Auth === 'undefined') {
    window.Auth = {
        TOKEN_KEY: 'auth_token',
        USER_KEY: 'auth_user',

        getToken() {
            return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
        },

        getUser() {
            const user = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
            return user ? JSON.parse(user) : null;
        },

        isLoggedIn() {
            return !!this.getToken();
        },

        logout() {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
            sessionStorage.removeItem(this.TOKEN_KEY);
            sessionStorage.removeItem(this.USER_KEY);
        }
    };
}
