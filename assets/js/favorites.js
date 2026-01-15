/**
 * ИЗБРАННОЕ - JAVASCRIPT
 */

class FavoritesPage {
    constructor() {
        this.favorites = [];
        this.products = [];
        
        this.init();
    }
    
    init() {
        this.loadFavorites();
        this.loadProducts();
        this.bindEvents();
        this.render();
        this.loadRecentlyViewed();
        this.updateHeaderCounts();
    }
    
    loadFavorites() {
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    }
    
    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateHeaderCounts();
    }
    
    loadProducts() {
        // Тестовые товары
        this.products = [
            { id: 1, name: 'Букет из 25 красных роз', price: 2500, old_price: 3000, image: 'assets/img/products/product-1.svg', badge: 'Хит' },
            { id: 2, name: 'Букет тюльпанов', price: 1800, old_price: null, image: 'assets/img/products/product-2.svg', badge: 'Новинка' },
            { id: 3, name: 'Свадебный букет невесты', price: 3500, old_price: null, image: 'assets/img/products/product-3.svg', badge: null },
            { id: 4, name: 'Композиция в корзине', price: 2200, old_price: null, image: 'assets/img/products/product-4.svg', badge: null },
            { id: 5, name: 'Букет из пионов', price: 3200, old_price: 3800, image: 'assets/img/products/product-5.svg', badge: 'Хит' },
            { id: 6, name: 'Эксклюзивный букет', price: 4500, old_price: null, image: 'assets/img/products/product-6.svg', badge: 'Exclusive' },
            { id: 7, name: 'Flower Box Нежность', price: 2800, old_price: null, image: 'assets/img/products/product-1.svg', badge: 'Новинка' },
            { id: 8, name: 'Корзина с гортензиями', price: 3800, old_price: 4200, image: 'assets/img/products/product-2.svg', badge: null },
            { id: 9, name: 'Букет с лилиями', price: 2700, old_price: null, image: 'assets/img/products/product-3.svg', badge: null },
            { id: 10, name: 'Шляпная коробка Premium', price: 4200, old_price: null, image: 'assets/img/products/product-4.svg', badge: 'Premium' },
            { id: 11, name: 'Букет из эустомы', price: 2300, old_price: null, image: 'assets/img/products/product-5.svg', badge: 'Новинка' },
            { id: 12, name: 'Композиция в вазе', price: 3100, old_price: null, image: 'assets/img/products/product-6.svg', badge: null },
        ];
    }
    
    bindEvents() {
        // Добавить всё в корзину
        const addAllBtn = document.getElementById('addAllToCart');
        if (addAllBtn) {
            addAllBtn.addEventListener('click', () => this.addAllToCart());
        }
        
        // Очистить избранное
        const clearBtn = document.getElementById('clearFavorites');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.confirmClear());
        }
    }
    
    render() {
        const emptyEl = document.getElementById('favoritesEmpty');
        const contentEl = document.getElementById('favoritesContent');
        const countEl = document.getElementById('favoritesCount');
        
        // Обновляем счётчик
        countEl.textContent = this.favorites.length;
        
        if (this.favorites.length === 0) {
            emptyEl.style.display = 'block';
            contentEl.style.display = 'none';
        } else {
            emptyEl.style.display = 'none';
            contentEl.style.display = 'block';
            this.renderFavorites();
        }
    }
    
    renderFavorites() {
        const grid = document.getElementById('favoritesGrid');
        if (!grid) return;
        
        const favoriteProducts = this.products.filter(p => this.favorites.includes(p.id));
        
        grid.innerHTML = favoriteProducts.map(product => `
            <div class="favorite-card" data-id="${product.id}" data-aos="fade-up">
                <div class="favorite-card__image">
                    <a href="product.html?id=${product.id}">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </a>
                    ${product.badge ? `<span class="favorite-card__badge">${product.badge}</span>` : ''}
                    <button class="favorite-card__remove" onclick="favoritesPage.removeFromFavorites(${product.id})" title="Удалить из избранного">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                </div>
                <div class="favorite-card__content">
                    <h3 class="favorite-card__title">
                        <a href="product.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="favorite-card__price">
                        ${this.formatPrice(product.price)} ₽
                        ${product.old_price ? `<span class="favorite-card__old-price">${this.formatPrice(product.old_price)} ₽</span>` : ''}
                    </div>
                    <div class="favorite-card__actions">
                        <button class="btn btn-primary" onclick="favoritesPage.addToCart(${product.id})">
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Реинициализируем AOS для новых элементов
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
    
    removeFromFavorites(productId) {
        // Анимация удаления
        const card = document.querySelector(`.favorite-card[data-id="${productId}"]`);
        if (card) {
            card.classList.add('removing');
            
            setTimeout(() => {
                this.favorites = this.favorites.filter(id => id !== productId);
                this.saveFavorites();
                this.render();
                this.showNotification('Удалено из избранного', 'info');
            }, 300);
        }
    }
    
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        if (window.SamsonBuket) {
            window.SamsonBuket.addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
            });
        } else {
            // Fallback - добавляем в localStorage напрямую
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existing = cart.find(item => item.id === product.id);
            
            if (existing) {
                existing.quantity++;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            this.updateHeaderCounts();
            this.showNotification('Товар добавлен в корзину', 'success');
        }
    }
    
    addAllToCart() {
        if (this.favorites.length === 0) return;
        
        const favoriteProducts = this.products.filter(p => this.favorites.includes(p.id));
        
        favoriteProducts.forEach(product => {
            if (window.SamsonBuket) {
                window.SamsonBuket.addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image
                }, false); // Без уведомлений для каждого
            } else {
                let cart = JSON.parse(localStorage.getItem('cart') || '[]');
                const existing = cart.find(item => item.id === product.id);
                
                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1
                    });
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
            }
        });
        
        this.updateHeaderCounts();
        this.showNotification(`${favoriteProducts.length} товаров добавлено в корзину`, 'success');
    }
    
    confirmClear() {
        // Создаём подтверждение
        const confirm = document.createElement('div');
        confirm.className = 'clear-confirm';
        confirm.innerHTML = `
            <p>Очистить избранное?</p>
            <div class="clear-confirm__actions">
                <button class="btn-confirm">Очистить</button>
                <button class="btn-cancel">Отмена</button>
            </div>
        `;
        
        document.body.appendChild(confirm);
        
        // Обработчики
        confirm.querySelector('.btn-confirm').addEventListener('click', () => {
            this.clearFavorites();
            confirm.remove();
        });
        
        confirm.querySelector('.btn-cancel').addEventListener('click', () => {
            confirm.remove();
        });
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            if (confirm.parentElement) {
                confirm.remove();
            }
        }, 5000);
    }
    
    clearFavorites() {
        this.favorites = [];
        this.saveFavorites();
        this.render();
        this.showNotification('Избранное очищено', 'info');
    }
    
    loadRecentlyViewed() {
        const section = document.getElementById('recentlySection');
        const grid = document.getElementById('recentlyGrid');
        
        if (!section || !grid) return;
        
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
        // Фильтруем - не показываем то, что в избранном
        const filteredViewed = viewed.filter(p => !this.favorites.includes(p.id));
        
        if (filteredViewed.length < 2) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        
        grid.innerHTML = filteredViewed.slice(0, 5).map(product => `
            <div class="recently-card">
                <div class="recently-card__image">
                    <a href="product.html?id=${product.id}">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </a>
                </div>
                <div class="recently-card__content">
                    <h4 class="recently-card__title">
                        <a href="product.html?id=${product.id}">${product.name}</a>
                    </h4>
                    <div class="recently-card__price">${this.formatPrice(product.price)} ₽</div>
                </div>
            </div>
        `).join('');
    }
    
    updateHeaderCounts() {
        // Счётчик избранного
        const favCountEl = document.querySelector('.favorites-count');
        if (favCountEl) {
            favCountEl.textContent = this.favorites.length;
            favCountEl.style.display = this.favorites.length > 0 ? 'flex' : 'none';
        }
        
        // Счётчик корзины
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountEl = document.querySelector('.cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = cartCount;
            cartCountEl.style.display = cartCount > 0 ? 'flex' : 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        if (window.SamsonBuket && window.SamsonBuket.showNotification) {
            window.SamsonBuket.showNotification(message, type);
        } else {
            // Fallback уведомление
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#333'};
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }
    
    formatPrice(price) {
        return price.toLocaleString('ru-RU');
    }
}

// Глобальная переменная для доступа из HTML
let favoritesPage;

document.addEventListener('DOMContentLoaded', () => {
    favoritesPage = new FavoritesPage();
});


