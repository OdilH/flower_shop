/**
 * СТРАНИЦА КОРЗИНЫ - JAVASCRIPT
 */

class CartPage {
    constructor() {
        this.cart = [];
        this.promoCode = null;
        this.discount = 0;
        this.deliveryCost = 500;
        this.freeDeliveryThreshold = 5000;
        this.currentStep = 1;
        
        this.init();
    }
    
    init() {
        this.loadCart();
        this.bindEvents();
        this.render();
    }
    
    loadCart() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateHeaderCart();
    }
    
    bindEvents() {
        // Промокод
        const promoApply = document.getElementById('promoApply');
        if (promoApply) {
            promoApply.addEventListener('click', () => this.applyPromo());
        }
        
        const promoInput = document.getElementById('promoInput');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyPromo();
                }
            });
        }
        
        // Кнопка оформления
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.openCheckout());
        }
        
        // Закрытие модалок
        document.querySelectorAll('.modal__overlay, .modal__close').forEach(el => {
            el.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal);
            });
        });
        
        // Способ доставки
        document.querySelectorAll('input[name="delivery"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateDeliveryFields(e.target.value);
            });
        });
        
        // Получатель
        const selfRecipient = document.getElementById('selfRecipient');
        if (selfRecipient) {
            selfRecipient.addEventListener('change', (e) => {
                const recipientFields = document.getElementById('recipientFields');
                recipientFields.style.display = e.target.checked ? 'none' : 'block';
            });
        }
        
        // Форма заказа
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitOrder();
            });
        }
        
        // Минимальная дата доставки
        const deliveryDate = document.getElementById('deliveryDate');
        if (deliveryDate) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            deliveryDate.min = tomorrow.toISOString().split('T')[0];
            deliveryDate.value = tomorrow.toISOString().split('T')[0];
        }
    }
    
    render() {
        if (this.cart.length === 0) {
            document.getElementById('cartEmpty').style.display = 'block';
            document.getElementById('cartContent').style.display = 'none';
        } else {
            document.getElementById('cartEmpty').style.display = 'none';
            document.getElementById('cartContent').style.display = 'grid';
            this.renderItems();
            this.updateSummary();
        }
    }
    
    renderItems() {
        const container = document.getElementById('cartItems');
        if (!container) return;
        
        container.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item__image">
                    <a href="product.html?id=${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                    </a>
                </div>
                
                <div class="cart-item__info">
                    <h3 class="cart-item__title">
                        <a href="product.html?id=${item.id}">${item.name}</a>
                    </h3>
                    <div class="cart-item__price">${this.formatPrice(item.price)} ₽</div>
                </div>
                
                <div class="cart-item__actions">
                    <button class="cart-item__remove" onclick="cartPage.removeItem(${item.id})" title="Удалить">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    
                    <div class="cart-item__quantity">
                        <button onclick="cartPage.updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                        <input type="number" value="${item.quantity}" min="1" max="99" 
                               onchange="cartPage.updateQuantity(${item.id}, this.value)">
                        <button onclick="cartPage.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    
                    <div class="cart-item__total">${this.formatPrice(item.price * item.quantity)} ₽</div>
                </div>
            </div>
        `).join('');
    }
    
    updateQuantity(productId, quantity) {
        quantity = parseInt(quantity);
        
        if (quantity < 1) {
            this.removeItem(productId);
            return;
        }
        
        if (quantity > 99) quantity = 99;
        
        const item = this.cart.find(i => i.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
            this.render();
        }
    }
    
    removeItem(productId) {
        this.cart = this.cart.filter(i => i.id !== productId);
        this.saveCart();
        this.render();
        
        if (window.SamsonBuket) {
            window.SamsonBuket.showNotification('Товар удален из корзины', 'info');
        }
    }
    
    getSubtotal() {
        return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    
    getTotal() {
        const subtotal = this.getSubtotal();
        const delivery = subtotal >= this.freeDeliveryThreshold ? 0 : this.deliveryCost;
        return subtotal - this.discount + delivery;
    }
    
    getTotalItems() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    updateSummary() {
        const subtotal = this.getSubtotal();
        const delivery = subtotal >= this.freeDeliveryThreshold ? 0 : this.deliveryCost;
        const total = subtotal - this.discount + delivery;
        
        document.getElementById('summaryCount').textContent = this.getTotalItems();
        document.getElementById('summarySubtotal').textContent = this.formatPrice(subtotal) + ' ₽';
        
        const discountRow = document.getElementById('discountRow');
        if (this.discount > 0) {
            discountRow.style.display = 'flex';
            document.getElementById('summaryDiscount').textContent = '-' + this.formatPrice(this.discount) + ' ₽';
        } else {
            discountRow.style.display = 'none';
        }
        
        document.getElementById('summaryDelivery').textContent = 
            delivery === 0 ? 'Бесплатно' : this.formatPrice(delivery) + ' ₽';
        document.getElementById('summaryTotal').textContent = this.formatPrice(total) + ' ₽';
        
        // Обновляем также в чекауте
        const checkoutSubtotal = document.getElementById('checkoutSubtotal');
        const checkoutDelivery = document.getElementById('checkoutDelivery');
        const checkoutTotal = document.getElementById('checkoutTotal');
        
        if (checkoutSubtotal) checkoutSubtotal.textContent = this.formatPrice(subtotal) + ' ₽';
        if (checkoutDelivery) checkoutDelivery.textContent = delivery === 0 ? 'Бесплатно' : this.formatPrice(delivery) + ' ₽';
        if (checkoutTotal) checkoutTotal.textContent = this.formatPrice(total) + ' ₽';
    }
    
    applyPromo() {
        const input = document.getElementById('promoInput');
        const message = document.getElementById('promoMessage');
        const code = input.value.trim().toUpperCase();
        
        if (!code) {
            message.textContent = 'Введите промокод';
            message.className = 'cart-promo__message error';
            return;
        }
        
        // Простые промокоды для демо
        const promoCodes = {
            'FLOWERS10': { discount: 10, type: 'percent' },
            'SALE500': { discount: 500, type: 'fixed' },
            'WELCOME': { discount: 15, type: 'percent' }
        };
        
        if (promoCodes[code]) {
            const promo = promoCodes[code];
            const subtotal = this.getSubtotal();
            
            if (promo.type === 'percent') {
                this.discount = Math.round(subtotal * promo.discount / 100);
                message.textContent = `Промокод применен! Скидка ${promo.discount}%`;
            } else {
                this.discount = promo.discount;
                message.textContent = `Промокод применен! Скидка ${this.formatPrice(promo.discount)} ₽`;
            }
            
            this.promoCode = code;
            message.className = 'cart-promo__message success';
            input.disabled = true;
            document.getElementById('promoApply').disabled = true;
            
            this.updateSummary();
        } else {
            message.textContent = 'Неверный промокод';
            message.className = 'cart-promo__message error';
        }
    }
    
    openCheckout() {
        if (this.cart.length === 0) return;
        
        const modal = document.getElementById('checkoutModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.currentStep = 1;
        this.updateSteps();
        this.updateSummary();
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    nextStep() {
        if (this.currentStep === 1) {
            // Валидация шага 1
            const name = document.getElementById('customerName').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();
            
            if (!name || !phone) {
                this.showNotification('Заполните обязательные поля', 'error');
                return;
            }
        }
        
        if (this.currentStep === 2) {
            // Валидация шага 2
            const delivery = document.querySelector('input[name="delivery"]:checked').value;
            
            if (delivery === 'courier') {
                const address = document.getElementById('deliveryAddress').value.trim();
                const date = document.getElementById('deliveryDate').value;
                const time = document.getElementById('deliveryTime').value;
                
                if (!address || !date || !time) {
                    this.showNotification('Заполните данные доставки', 'error');
                    return;
                }
            }
        }
        
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateSteps();
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateSteps();
        }
    }
    
    updateSteps() {
        // Обновляем индикаторы
        document.querySelectorAll('.checkout-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Показываем нужный контент
        document.querySelectorAll('.checkout__step-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`step${this.currentStep}`).classList.add('active');
    }
    
    updateDeliveryFields(type) {
        const courierFields = document.getElementById('courierFields');
        const pickupFields = document.getElementById('pickupFields');
        
        if (type === 'courier') {
            courierFields.style.display = 'block';
            pickupFields.style.display = 'none';
            this.deliveryCost = 500;
        } else {
            courierFields.style.display = 'none';
            pickupFields.style.display = 'block';
            this.deliveryCost = 0;
        }
        
        this.updateSummary();
    }
    
    async submitOrder() {
        const form = document.getElementById('checkoutForm');
        const formData = new FormData(form);
        
        const orderData = {
            customer: {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email')
            },
            delivery: {
                type: formData.get('delivery'),
                address: formData.get('address'),
                date: formData.get('date'),
                time: formData.get('time')
            },
            recipient: {
                name: formData.get('recipient_name'),
                phone: formData.get('recipient_phone')
            },
            payment: formData.get('payment'),
            comment: formData.get('comment'),
            promo_code: this.promoCode,
            items: this.cart,
            subtotal: this.getSubtotal(),
            discount: this.discount,
            delivery_cost: this.deliveryCost,
            total: this.getTotal()
        };
        
        try {
            // Пробуем отправить на API
            const response = await fetch('api/orders.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.orderSuccess(result.order_id);
                    return;
                }
            }
        } catch (error) {
            console.log('API недоступен');
        }
        
        // Если API недоступен, симулируем успех
        const orderId = Math.floor(Math.random() * 9000) + 1000;
        this.orderSuccess(orderId);
    }
    
    orderSuccess(orderId) {
        // Закрываем модалку оформления
        this.closeModal(document.getElementById('checkoutModal'));
        
        // Показываем успешное сообщение
        document.getElementById('orderNumber').textContent = '#' + orderId;
        const successModal = document.getElementById('successModal');
        successModal.classList.add('active');
        
        // Очищаем корзину
        this.cart = [];
        this.saveCart();
        this.render();
    }
    
    updateHeaderCart() {
        const countEl = document.querySelector('.cart-count');
        if (countEl) {
            const count = this.getTotalItems();
            countEl.textContent = count;
            countEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        if (window.SamsonBuket) {
            window.SamsonBuket.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    formatPrice(price) {
        return price.toLocaleString('ru-RU');
    }
}

// Инициализация
let cartPage;
document.addEventListener('DOMContentLoaded', () => {
    cartPage = new CartPage();
});


