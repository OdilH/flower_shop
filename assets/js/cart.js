/**
 * КОРЗИНА - ФУНКЦИОНАЛЬНОСТЬ
 */

class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart') || '[]');
        this.init();
    }
    
    init() {
        this.render();
        this.attachEvents();
    }
    
    /**
     * Добавить товар в корзину
     */
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.save();
        this.updateUI();
        window.SamsonBuket?.showNotification('Товар добавлен в корзину!');
    }
    
    /**
     * Удалить товар из корзины
     */
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.render();
        this.updateUI();
        window.SamsonBuket?.showNotification('Товар удален из корзины');
    }
    
    /**
     * Изменить количество товара
     */
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.save();
                this.render();
                this.updateUI();
            }
        }
    }
    
    /**
     * Очистить корзину
     */
    clear() {
        this.items = [];
        this.save();
        this.render();
        this.updateUI();
    }
    
    /**
     * Получить общую сумму
     */
    getTotal() {
        return this.items.reduce((sum, item) => {
            return sum + (item.price * (item.quantity || 1));
        }, 0);
    }
    
    /**
     * Получить количество товаров
     */
    getItemCount() {
        return this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    
    /**
     * Сохранить в localStorage
     */
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
    
    /**
     * Обновить UI (счетчик в header)
     */
    updateUI() {
        const count = this.getItemCount();
        const cartCount = document.querySelector('.cart-count');
        
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
        
        // Обновляем глобальную функцию
        if (window.SamsonBuket) {
            window.SamsonBuket.updateCartCount();
        }
    }
    
    /**
     * Отрисовать корзину на странице
     */
    render() {
        const cartContainer = document.querySelector('.cart-items');
        if (!cartContainer) return;
        
        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="cart-empty">
                    <p>Ваша корзина пуста</p>
                    <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        this.items.forEach(item => {
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item__image">
                        <img src="${item.image || 'assets/img/products/default.jpg'}" alt="${item.name}">
                    </div>
                    <div class="cart-item__info">
                        <h3 class="cart-item__title">${item.name}</h3>
                        <p class="cart-item__description">${item.description || ''}</p>
                    </div>
                    <div class="cart-item__quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity || 1}" min="1" data-id="${item.id}">
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item__price">
                        ${(item.price * (item.quantity || 1)).toLocaleString('ru-RU')} ₽
                    </div>
                    <button class="cart-item__remove" data-id="${item.id}">×</button>
                </div>
            `;
        });
        
        cartContainer.innerHTML = html;
        
        // Обновляем итоговую сумму
        const totalElement = document.querySelector('.cart-total');
        if (totalElement) {
            totalElement.textContent = this.getTotal().toLocaleString('ru-RU') + ' ₽';
        }
    }
    
    /**
     * Привязать события
     */
    attachEvents() {
        // Удаление товара
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-item__remove')) {
                const id = parseInt(e.target.dataset.id);
                this.removeItem(id);
            }
        });
        
        // Изменение количества
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn')) {
                const id = parseInt(e.target.dataset.id);
                const item = this.items.find(item => item.id === id);
                
                if (item) {
                    let quantity = item.quantity || 1;
                    
                    if (e.target.classList.contains('plus')) {
                        quantity++;
                    } else if (e.target.classList.contains('minus')) {
                        quantity = Math.max(1, quantity - 1);
                    }
                    
                    this.updateQuantity(id, quantity);
                }
            }
        });
        
        // Изменение через input
        document.addEventListener('change', (e) => {
            if (e.target.type === 'number' && e.target.dataset.id) {
                const id = parseInt(e.target.dataset.id);
                const quantity = parseInt(e.target.value) || 1;
                this.updateQuantity(id, quantity);
            }
        });
    }
}

// Инициализация корзины
let cart;

document.addEventListener('DOMContentLoaded', function() {
    cart = new Cart();
    
    // Делаем доступным глобально
    window.cart = cart;
});


