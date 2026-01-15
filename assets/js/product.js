/**
 * СТРАНИЦА ТОВАРА - JAVASCRIPT
 */

class ProductPage {
    constructor() {
        this.product = null;
        this.quantity = 1;
        this.currentImageIndex = 0;
        this.images = [];
        
        this.init();
    }
    
    init() {
        this.loadProduct();
        this.loadRecentlyViewed();
    }
    
    async loadProduct() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        
        if (!productId) {
            this.showError('Товар не найден');
            return;
        }
        
        try {
            // Попытка загрузить с API
            const response = await fetch(`api/product.php?id=${productId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.product = data.data;
                }
            }
        } catch (error) {
            console.log('API недоступен, используем тестовые данные');
        }
        
        // Если API недоступен, используем тестовые данные
        if (!this.product) {
            this.product = this.getTestProduct(parseInt(productId));
        }
        
        if (this.product) {
            this.renderProduct();
            this.saveToRecentlyViewed();
            this.loadRelatedProducts();
            this.bindEvents();
        } else {
            this.showError('Товар не найден');
        }
    }
    
    getTestProduct(id) {
        const products = {
            1: {
                id: 1,
                name: 'Букет из 25 красных роз',
                slug: 'bouquet-25-red-roses',
                price: 2500,
                old_price: 3000,
                category: 'Букеты',
                category_slug: 'bukety',
                sku: 'BK-001',
                description: 'Роскошный букет из 25 красных роз премиум класса. Идеальный подарок для выражения чувств. Свежие цветы с доставкой по Москве.',
                badge: 'Хит',
                in_stock: true,
                images: [
                    'assets/img/products/product-1.svg',
                    'assets/img/products/product-2.svg',
                    'assets/img/products/product-3.svg'
                ],
                composition: [
                    { name: 'Роза красная', count: 25 },
                    { name: 'Эвкалипт', count: 5 },
                    { name: 'Упаковка', count: 1 }
                ],
                specs: {
                    height: '50-60 см',
                    freshness: '10-14 дней',
                    packaging: 'Авторская упаковка'
                }
            },
            2: {
                id: 2,
                name: 'Букет тюльпанов',
                slug: 'bouquet-tulips',
                price: 1800,
                old_price: null,
                category: 'Букеты',
                category_slug: 'bukety',
                sku: 'BK-002',
                description: 'Яркий весенний букет из свежих тюльпанов различных оттенков. Символ весны и нежности.',
                badge: 'Новинка',
                in_stock: true,
                images: [
                    'assets/img/products/product-2.svg',
                    'assets/img/products/product-3.svg'
                ],
                composition: [
                    { name: 'Тюльпаны', count: 15 },
                    { name: 'Упаковка', count: 1 }
                ],
                specs: {
                    height: '40-50 см',
                    freshness: '7-10 дней',
                    packaging: 'Крафт упаковка'
                }
            },
            3: {
                id: 3,
                name: 'Свадебный букет невесты',
                slug: 'wedding-bouquet-white',
                price: 3500,
                old_price: null,
                category: 'Свадьба',
                category_slug: 'wedding',
                sku: 'SV-001',
                description: 'Нежный белый свадебный букет из роз и эустомы. Создан специально для невесты.',
                badge: null,
                in_stock: true,
                images: [
                    'assets/img/products/product-3.svg'
                ],
                composition: [
                    { name: 'Роза белая', count: 7 },
                    { name: 'Эустома', count: 5 },
                    { name: 'Гипсофила', count: 3 }
                ],
                specs: {
                    height: '30-35 см',
                    freshness: '7-10 дней',
                    packaging: 'Атласная лента'
                }
            }
        };
        
        return products[id] || products[1];
    }
    
    renderProduct() {
        const container = document.getElementById('productContent');
        
        // Устанавливаем заголовок страницы
        document.title = `${this.product.name} - Букеты & цветы`;
        document.getElementById('breadcrumbProduct').textContent = this.product.name;
        
        // Формируем изображения
        this.images = this.product.images || ['assets/img/products/product-1.svg'];
        
        const html = `
            <!-- Галерея -->
            <div class="product-gallery" data-aos="fade-right">
                <div class="product-gallery__main">
                    <img src="${this.images[0]}" alt="${this.product.name}" id="mainImage">
                    ${this.product.badge ? `<span class="product-gallery__badge">${this.product.badge}</span>` : ''}
                    <button class="product-gallery__zoom" id="zoomBtn" title="Увеличить">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                    </button>
                </div>
                ${this.images.length > 1 ? `
                <div class="product-gallery__thumbs">
                    ${this.images.map((img, i) => `
                        <div class="product-gallery__thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                            <img src="${img}" alt="${this.product.name}">
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
            
            <!-- Информация -->
            <div class="product-info" data-aos="fade-left">
                <a href="catalog.html?category=${this.product.category_slug}" class="product-info__category">${this.product.category}</a>
                <h1 class="product-info__title">${this.product.name}</h1>
                <p class="product-info__sku">Артикул: ${this.product.sku}</p>
                
                <div class="product-price">
                    <span class="product-price__current">${this.formatPrice(this.product.price)} ₽</span>
                    ${this.product.old_price ? `
                        <span class="product-price__old">${this.formatPrice(this.product.old_price)} ₽</span>
                        <span class="product-price__discount">-${Math.round((1 - this.product.price / this.product.old_price) * 100)}%</span>
                    ` : ''}
                </div>
                
                <div class="product-description">
                    <p>${this.product.description}</p>
                </div>
                
                <div class="product-specs">
                    <h3 class="product-specs__title">Характеристики</h3>
                    <div class="product-specs__list">
                        ${this.product.specs ? `
                            <div class="product-specs__item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2v20M2 12h20"/>
                                </svg>
                                <span class="product-specs__label">Высота:</span>
                                <span class="product-specs__value">${this.product.specs.height}</span>
                            </div>
                            <div class="product-specs__item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                                </svg>
                                <span class="product-specs__label">Свежесть:</span>
                                <span class="product-specs__value">${this.product.specs.freshness}</span>
                            </div>
                            <div class="product-specs__item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>
                                </svg>
                                <span class="product-specs__label">Упаковка:</span>
                                <span class="product-specs__value">${this.product.specs.packaging}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="product-quantity">
                    <span class="quantity-label">Количество:</span>
                    <div class="quantity-controls">
                        <button class="quantity-btn" id="quantityMinus">−</button>
                        <input type="number" class="quantity-input" id="quantityInput" value="1" min="1" max="99">
                        <button class="quantity-btn" id="quantityPlus">+</button>
                    </div>
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-primary" id="addToCartBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        В корзину
                    </button>
                    <button class="btn btn-outline" id="buyNowBtn">Купить сейчас</button>
                    <button class="btn btn-outline btn-favorite ${this.isInFavorites() ? 'active' : ''}" id="favoriteBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${this.isInFavorites() ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="product-delivery">
                    <div class="product-delivery__item">
                        <div class="product-delivery__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                        </div>
                        <div class="product-delivery__text">
                            <h4>Доставка по Москве</h4>
                            <p>от 500 ₽ • бесплатно от 5000 ₽</p>
                        </div>
                    </div>
                    <div class="product-delivery__item">
                        <div class="product-delivery__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                            </svg>
                        </div>
                        <div class="product-delivery__text">
                            <h4>Доставка сегодня</h4>
                            <p>при заказе до 18:00</p>
                        </div>
                    </div>
                    <div class="product-delivery__item">
                        <div class="product-delivery__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                        <div class="product-delivery__text">
                            <h4>Гарантия свежести</h4>
                            <p>Заменим букет, если не понравится</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Вкладки -->
            <div class="product-tabs" style="grid-column: 1 / -1;">
                <div class="product-tabs__nav">
                    <button class="product-tabs__btn active" data-tab="composition">Состав букета</button>
                    <button class="product-tabs__btn" data-tab="delivery">Доставка и оплата</button>
                    <button class="product-tabs__btn" data-tab="reviews">Отзывы</button>
                </div>
                
                <div class="product-tabs__content active" id="tab-composition">
                    <div class="composition-list">
                        ${this.product.composition ? this.product.composition.map(item => `
                            <div class="composition-item">
                                <span class="composition-item__icon">🌸</span>
                                <div>
                                    <span class="composition-item__name">${item.name}</span>
                                    <span class="composition-item__count">× ${item.count}</span>
                                </div>
                            </div>
                        `).join('') : '<p>Состав уточняйте по телефону</p>'}
                    </div>
                </div>
                
                <div class="product-tabs__content" id="tab-delivery">
                    <h3>Доставка</h3>
                    <p>Доставка осуществляется по Москве и Московской области.</p>
                    <ul>
                        <li>Стоимость доставки по Москве от 500 ₽</li>
                        <li>Бесплатная доставка при заказе от 5000 ₽</li>
                        <li>Доставка в день заказа при оформлении до 18:00</li>
                    </ul>
                    
                    <h3>Оплата</h3>
                    <p>Принимаем оплату:</p>
                    <ul>
                        <li>Наличными при получении</li>
                        <li>Банковской картой онлайн</li>
                        <li>Переводом на карту</li>
                    </ul>
                </div>
                
                <div class="product-tabs__content" id="tab-reviews">
                    <div class="reviews-list" id="reviewsList">
                        <div class="review-card">
                            <div class="review-card__header">
                                <div class="review-card__author">
                                    <div class="review-card__avatar">А</div>
                                    <div>
                                        <div class="review-card__name">Анна</div>
                                        <div class="review-card__date">15 ноября 2024</div>
                                    </div>
                                </div>
                                <div class="review-card__rating">
                                    ★★★★★
                                </div>
                            </div>
                            <p class="review-card__text">Заказывала этот букет на день рождения подруги. Цветы пришли свежие, красиво упакованы. Доставили вовремя. Очень довольна!</p>
                        </div>
                        <div class="review-card">
                            <div class="review-card__header">
                                <div class="review-card__author">
                                    <div class="review-card__avatar">М</div>
                                    <div>
                                        <div class="review-card__name">Михаил</div>
                                        <div class="review-card__date">10 ноября 2024</div>
                                    </div>
                                </div>
                                <div class="review-card__rating">
                                    ★★★★☆
                                </div>
                            </div>
                            <p class="review-card__text">Хороший букет, жена осталась довольна. Единственное - доставка немного задержалась.</p>
                        </div>
                    </div>
                    
                    <div class="review-form">
                        <h3 class="review-form__title">Оставить отзыв</h3>
                        <form id="reviewForm">
                            <div class="review-form__rating">
                                <label>Оценка:</label>
                                <div class="star-rating">
                                    <input type="radio" name="rating" value="5" id="star5">
                                    <label for="star5">★</label>
                                    <input type="radio" name="rating" value="4" id="star4">
                                    <label for="star4">★</label>
                                    <input type="radio" name="rating" value="3" id="star3">
                                    <label for="star3">★</label>
                                    <input type="radio" name="rating" value="2" id="star2">
                                    <label for="star2">★</label>
                                    <input type="radio" name="rating" value="1" id="star1">
                                    <label for="star1">★</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <input type="text" name="name" placeholder="Ваше имя" required class="form-input">
                            </div>
                            <div class="form-group">
                                <textarea name="text" placeholder="Ваш отзыв" rows="4" required class="form-input"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Отправить отзыв</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    bindEvents() {
        // Количество
        const quantityInput = document.getElementById('quantityInput');
        const quantityMinus = document.getElementById('quantityMinus');
        const quantityPlus = document.getElementById('quantityPlus');
        
        if (quantityMinus) {
            quantityMinus.addEventListener('click', () => {
                if (this.quantity > 1) {
                    this.quantity--;
                    quantityInput.value = this.quantity;
                }
            });
        }
        
        if (quantityPlus) {
            quantityPlus.addEventListener('click', () => {
                if (this.quantity < 99) {
                    this.quantity++;
                    quantityInput.value = this.quantity;
                }
            });
        }
        
        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                let value = parseInt(e.target.value);
                if (value < 1) value = 1;
                if (value > 99) value = 99;
                this.quantity = value;
                e.target.value = value;
            });
        }
        
        // Добавить в корзину
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }
        
        // Купить сейчас
        const buyNowBtn = document.getElementById('buyNowBtn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                this.addToCart();
                window.location.href = 'cart.html';
            });
        }
        
        // Избранное
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                this.toggleFavorite(favoriteBtn);
            });
        }
        
        // Галерея
        document.querySelectorAll('.product-gallery__thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                this.changeImage(parseInt(thumb.dataset.index));
            });
        });
        
        // Зум
        const zoomBtn = document.getElementById('zoomBtn');
        if (zoomBtn) {
            zoomBtn.addEventListener('click', () => {
                this.openLightbox();
            });
        }
        
        // Вкладки
        document.querySelectorAll('.product-tabs__btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
        
        // Форма отзыва
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReview(reviewForm);
            });
        }
    }
    
    addToCart() {
        if (window.SamsonBuket) {
            for (let i = 0; i < this.quantity; i++) {
                window.SamsonBuket.addToCart({
                    id: this.product.id,
                    name: this.product.name,
                    price: this.product.price,
                    image: this.images[0]
                });
            }
            // Сброс количества после добавления
            this.quantity = 1;
            const quantityInput = document.getElementById('quantityInput');
            if (quantityInput) quantityInput.value = 1;
        }
    }
    
    isInFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favorites.includes(this.product?.id);
    }
    
    toggleFavorite(btn) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.indexOf(this.product.id);
        
        if (index > -1) {
            favorites.splice(index, 1);
            btn.classList.remove('active');
            btn.querySelector('svg').setAttribute('fill', 'none');
        } else {
            favorites.push(this.product.id);
            btn.classList.add('active');
            btn.querySelector('svg').setAttribute('fill', 'currentColor');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Обновляем счетчик
        const countEl = document.querySelector('.favorites-count');
        if (countEl) {
            countEl.textContent = favorites.length;
            countEl.style.display = favorites.length > 0 ? 'flex' : 'none';
        }
    }
    
    changeImage(index) {
        this.currentImageIndex = index;
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.src = this.images[index];
        }
        
        document.querySelectorAll('.product-gallery__thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
    
    openLightbox() {
        // Создаем лайтбокс если его нет
        let lightbox = document.querySelector('.lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <button class="lightbox__close">&times;</button>
                <button class="lightbox__nav lightbox__prev">←</button>
                <button class="lightbox__nav lightbox__next">→</button>
                <div class="lightbox__content">
                    <img src="" alt="">
                </div>
            `;
            document.body.appendChild(lightbox);
            
            // События
            lightbox.querySelector('.lightbox__close').addEventListener('click', () => this.closeLightbox());
            lightbox.querySelector('.lightbox__prev').addEventListener('click', () => this.lightboxPrev());
            lightbox.querySelector('.lightbox__next').addEventListener('click', () => this.lightboxNext());
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) this.closeLightbox();
            });
        }
        
        lightbox.querySelector('img').src = this.images[this.currentImageIndex];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeLightbox() {
        const lightbox = document.querySelector('.lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    lightboxPrev() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        document.querySelector('.lightbox img').src = this.images[this.currentImageIndex];
    }
    
    lightboxNext() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        document.querySelector('.lightbox img').src = this.images[this.currentImageIndex];
    }
    
    switchTab(tabId) {
        document.querySelectorAll('.product-tabs__btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        document.querySelectorAll('.product-tabs__content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
    }
    
    submitReview(form) {
        const formData = new FormData(form);
        const data = {
            product_id: this.product.id,
            name: formData.get('name'),
            rating: formData.get('rating'),
            text: formData.get('text')
        };
        
        // Добавляем отзыв в список
        const reviewsList = document.getElementById('reviewsList');
        const newReview = document.createElement('div');
        newReview.className = 'review-card';
        newReview.innerHTML = `
            <div class="review-card__header">
                <div class="review-card__author">
                    <div class="review-card__avatar">${data.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="review-card__name">${data.name}</div>
                        <div class="review-card__date">Только что</div>
                    </div>
                </div>
                <div class="review-card__rating">
                    ${'★'.repeat(data.rating || 5)}${'☆'.repeat(5 - (data.rating || 5))}
                </div>
            </div>
            <p class="review-card__text">${data.text}</p>
        `;
        
        reviewsList.insertBefore(newReview, reviewsList.firstChild);
        form.reset();
        
        // Показываем уведомление
        if (window.SamsonBuket) {
            window.SamsonBuket.showNotification('Спасибо за отзыв!', 'success');
        }
    }
    
    loadRelatedProducts() {
        const container = document.getElementById('relatedProducts');
        if (!container) return;
        
        // Тестовые похожие товары
        const related = [
            { id: 2, name: 'Букет тюльпанов', price: 1800, image: 'assets/img/products/product-2.svg' },
            { id: 3, name: 'Свадебный букет', price: 3500, image: 'assets/img/products/product-3.svg' },
            { id: 4, name: 'Композиция в корзине', price: 2200, image: 'assets/img/products/product-4.svg' },
            { id: 5, name: 'Букет из пионов', price: 3200, image: 'assets/img/products/product-5.svg' }
        ].filter(p => p.id !== this.product.id);
        
        container.innerHTML = related.map(product => `
            <div class="swiper-slide">
                <div class="product-card">
                    <div class="product-card__image">
                        <a href="product.html?id=${product.id}">
                            <img src="${product.image}" alt="${product.name}">
                        </a>
                    </div>
                    <div class="product-card__content">
                        <h3 class="product-card__title">
                            <a href="product.html?id=${product.id}">${product.name}</a>
                        </h3>
                        <div class="product-card__price">${this.formatPrice(product.price)} ₽</div>
                        <button class="btn btn-primary btn-block" onclick="productPage.quickAddToCart(${product.id}, '${product.name}', ${product.price}, '${product.image}')">
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Инициализируем слайдер
        new Swiper('.related-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            breakpoints: {
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
            }
        });
    }
    
    saveToRecentlyViewed() {
        let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
        // Удаляем текущий товар если он уже есть
        viewed = viewed.filter(p => p.id !== this.product.id);
        
        // Добавляем в начало
        viewed.unshift({
            id: this.product.id,
            name: this.product.name,
            price: this.product.price,
            image: this.images[0]
        });
        
        // Ограничиваем количество
        viewed = viewed.slice(0, 10);
        
        localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
    }
    
    loadRecentlyViewed() {
        const section = document.getElementById('recentlyViewed');
        const container = document.getElementById('recentlyViewedProducts');
        if (!section || !container) return;
        
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
        if (viewed.length < 2) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        
        container.innerHTML = viewed.slice(0, 8).map(product => `
            <div class="swiper-slide">
                <div class="product-card">
                    <div class="product-card__image">
                        <a href="product.html?id=${product.id}">
                            <img src="${product.image}" alt="${product.name}">
                        </a>
                    </div>
                    <div class="product-card__content">
                        <h3 class="product-card__title">
                            <a href="product.html?id=${product.id}">${product.name}</a>
                        </h3>
                        <div class="product-card__price">${this.formatPrice(product.price)} ₽</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        new Swiper('.recently-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            breakpoints: {
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
            }
        });
    }
    
    quickAddToCart(id, name, price, image) {
        if (window.SamsonBuket) {
            window.SamsonBuket.addToCart({ id, name, price, image });
        }
    }
    
    showError(message) {
        const container = document.getElementById('productContent');
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1;">
                <div class="no-results__icon">😔</div>
                <h3 class="no-results__title">${message}</h3>
                <p class="no-results__text">Попробуйте вернуться в каталог</p>
                <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
            </div>
        `;
    }
    
    formatPrice(price) {
        return price.toLocaleString('ru-RU');
    }
}

// Инициализация
let productPage;
document.addEventListener('DOMContentLoaded', () => {
    productPage = new ProductPage();
});


