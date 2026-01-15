/**
 * КАТАЛОГ - JAVASCRIPT
 */

class Catalog {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentCategory = '';
        this.currentFlowers = [];
        this.priceMin = 0;
        this.priceMax = 999999;
        this.sortBy = 'popular';
        this.viewMode = 'grid';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.parseUrlParams();
        this.loadProducts();
    }
    
    bindEvents() {
        // Фильтр категорий
        document.querySelectorAll('input[name="category"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        });
        
        // Фильтр цветов
        document.querySelectorAll('input[name="flower"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateFlowerFilters();
                this.currentPage = 1;
                this.applyFilters();
            });
        });
        
        // Фильтр цены
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const priceRange = document.getElementById('priceRange');
        
        if (priceMin) {
            priceMin.addEventListener('input', (e) => {
                this.priceMin = parseInt(e.target.value) || 0;
            });
        }
        
        if (priceMax) {
            priceMax.addEventListener('input', (e) => {
                this.priceMax = parseInt(e.target.value) || 999999;
            });
        }
        
        if (priceRange) {
            priceRange.addEventListener('input', (e) => {
                this.priceMax = parseInt(e.target.value);
                if (priceMax) priceMax.value = this.priceMax;
            });
        }
        
        // Кнопка применить фильтры
        const applyBtn = document.getElementById('applyFilters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.currentPage = 1;
                this.applyFilters();
                this.closeFiltersModal();
            });
        }
        
        // Кнопка сбросить фильтры
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
        
        // Сортировка
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }
        
        // Переключение вида
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setViewMode(btn.dataset.view);
            });
        });
        
        // Мобильное меню фильтров
        const filterToggle = document.getElementById('filterToggle');
        const filterClose = document.getElementById('filterClose');
        const catalogFilters = document.getElementById('catalogFilters');
        
        if (filterToggle) {
            filterToggle.addEventListener('click', () => {
                catalogFilters.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (filterClose) {
            filterClose.addEventListener('click', () => {
                this.closeFiltersModal();
            });
        }
        
        // Закрытие модального окна
        const modal = document.getElementById('quickViewModal');
        if (modal) {
            modal.querySelector('.modal__overlay').addEventListener('click', () => {
                this.closeQuickView();
            });
            modal.querySelector('.modal__close').addEventListener('click', () => {
                this.closeQuickView();
            });
        }
    }
    
    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('category')) {
            this.currentCategory = params.get('category');
            const categoryInput = document.querySelector(`input[name="category"][value="${this.currentCategory}"]`);
            if (categoryInput) {
                categoryInput.checked = true;
            }
        }
        
        if (params.has('flower')) {
            const flowers = params.get('flower').split(',');
            flowers.forEach(flower => {
                const input = document.querySelector(`input[name="flower"][value="${flower}"]`);
                if (input) {
                    input.checked = true;
                }
            });
            this.updateFlowerFilters();
        }
    }
    
    updateFlowerFilters() {
        this.currentFlowers = [];
        document.querySelectorAll('input[name="flower"]:checked').forEach(input => {
            this.currentFlowers.push(input.value);
        });
    }
    
    async loadProducts() {
        try {
            // Попытка загрузить с API
            const response = await fetch('api/products.php');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.products = data.data;
                }
            }
        } catch (error) {
            console.log('API недоступен, используем тестовые данные');
        }
        
        // Если API недоступен, используем тестовые данные
        if (this.products.length === 0) {
            this.products = this.getTestProducts();
        }
        
        this.applyFilters();
    }
    
    getTestProducts() {
        // Тестовые товары для демонстрации
        return [
            { id: 1, name: 'Букет из 25 красных роз', slug: 'bouquet-25-red-roses', price: 2500, category_slug: 'bukety', flowers: ['roza'], image: 'assets/img/products/product-1.svg', badge: 'Хит', is_popular: true, is_new: false },
            { id: 2, name: 'Букет тюльпанов', slug: 'bouquet-tulips', price: 1800, category_slug: 'bukety', flowers: ['tyul-pan'], image: 'assets/img/products/product-2.svg', badge: 'Новинка', is_popular: false, is_new: true },
            { id: 3, name: 'Свадебный букет', slug: 'wedding-bouquet', price: 3500, category_slug: 'wedding', flowers: ['roza', 'eustoma'], image: 'assets/img/products/product-3.svg', badge: null, is_popular: true, is_new: false },
            { id: 4, name: 'Композиция в корзине', slug: 'composition-basket', price: 2200, category_slug: 'korziny', flowers: ['roza', 'gortenziya'], image: 'assets/img/products/product-4.svg', badge: null, is_popular: false, is_new: false },
            { id: 5, name: 'Букет из пионов', slug: 'bouquet-peonies', price: 3200, category_slug: 'bukety', flowers: ['pion'], image: 'assets/img/products/product-5.svg', badge: 'Хит', is_popular: true, is_new: false },
            { id: 6, name: 'Эксклюзивный букет', slug: 'exclusive-bouquet', price: 4500, category_slug: 'exclusive', flowers: ['roza', 'pion', 'ranunkulyus'], image: 'assets/img/products/product-6.svg', badge: 'Exclusive', is_popular: true, is_new: true },
            { id: 7, name: 'Flower Box Нежность', slug: 'flower-box-tenderness', price: 2800, category_slug: 'flower-box', flowers: ['roza'], image: 'assets/img/products/product-1.svg', badge: null, is_popular: false, is_new: true },
            { id: 8, name: 'Корзина с гортензиями', slug: 'basket-hydrangeas', price: 3800, category_slug: 'korziny', flowers: ['gortenziya'], image: 'assets/img/products/product-2.svg', badge: null, is_popular: true, is_new: false },
            { id: 9, name: 'Букет с лилиями', slug: 'bouquet-lilies', price: 2700, category_slug: 'bukety', flowers: ['liliya'], image: 'assets/img/products/product-3.svg', badge: null, is_popular: false, is_new: false },
            { id: 10, name: 'Шляпная коробка Premium', slug: 'hat-box-premium', price: 4200, category_slug: 'shlap-korob', flowers: ['roza', 'pion'], image: 'assets/img/products/product-4.svg', badge: 'Premium', is_popular: true, is_new: false },
            { id: 11, name: 'Букет из эустомы', slug: 'bouquet-eustoma', price: 2300, category_slug: 'bukety', flowers: ['eustoma'], image: 'assets/img/products/product-5.svg', badge: null, is_popular: false, is_new: true },
            { id: 12, name: 'Композиция в вазе', slug: 'composition-vase', price: 3100, category_slug: 'kompozicii', flowers: ['roza', 'gortenziya', 'eustoma'], image: 'assets/img/products/product-6.svg', badge: null, is_popular: false, is_new: false },
        ];
    }
    
    applyFilters() {
        let filtered = [...this.products];
        
        // Фильтр по категории
        if (this.currentCategory) {
            filtered = filtered.filter(p => p.category_slug === this.currentCategory);
        }
        
        // Фильтр по типу цветов
        if (this.currentFlowers.length > 0) {
            filtered = filtered.filter(p => {
                if (!p.flowers) return false;
                return this.currentFlowers.some(f => p.flowers.includes(f));
            });
        }
        
        // Фильтр по цене
        filtered = filtered.filter(p => p.price >= this.priceMin && p.price <= this.priceMax);
        
        // Сортировка
        filtered = this.sortProducts(filtered);
        
        this.filteredProducts = filtered;
        this.renderProducts();
        this.renderPagination();
        this.updateResultsCount();
        this.renderActiveFilters();
        this.updateUrl();
    }
    
    sortProducts(products) {
        switch (this.sortBy) {
            case 'price-asc':
                return products.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return products.sort((a, b) => b.price - a.price);
            case 'new':
                return products.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
            case 'name':
                return products.sort((a, b) => a.name.localeCompare(b.name));
            case 'popular':
            default:
                return products.sort((a, b) => (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0));
        }
    }
    
    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(start, end);
        
        if (pageProducts.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <div class="no-results__icon">🌷</div>
                    <h3 class="no-results__title">Товары не найдены</h3>
                    <p class="no-results__text">Попробуйте изменить параметры поиска</p>
                    <button class="btn btn-primary" onclick="catalog.resetFilters()">Сбросить фильтры</button>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = pageProducts.map(product => this.renderProductCard(product)).join('');
        
        // Применяем класс для режима просмотра
        if (this.viewMode === 'list') {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }
        
        // Привязываем события
        this.bindProductEvents();
    }
    
    renderProductCard(product) {
        const isFavorite = this.isInFavorites(product.id);
        
        return `
            <div class="product-card" data-aos="fade-up" data-id="${product.id}">
                <div class="product-card__image">
                    <a href="product.html?id=${product.id}">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </a>
                    ${product.badge ? `<span class="product-card__badge">${product.badge}</span>` : ''}
                    <div class="product-card__actions">
                        <button class="product-card__action-btn ${isFavorite ? 'active' : ''}" 
                                data-action="favorite" data-id="${product.id}" title="В избранное">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                        <button class="product-card__action-btn" data-action="quickview" data-id="${product.id}" title="Быстрый просмотр">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="product-card__content">
                    <h3 class="product-card__title">
                        <a href="product.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="product-card__price">${this.formatPrice(product.price)} ₽</div>
                    <button class="btn btn-primary btn-block" data-action="addtocart" data-id="${product.id}">
                        В корзину
                    </button>
                </div>
            </div>
        `;
    }
    
    bindProductEvents() {
        // Добавить в корзину
        document.querySelectorAll('[data-action="addtocart"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(btn.dataset.id);
                const product = this.products.find(p => p.id === productId);
                if (product && window.SamsonBuket) {
                    window.SamsonBuket.addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image
                    });
                }
            });
        });
        
        // Добавить в избранное
        document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(btn.dataset.id);
                this.toggleFavorite(productId, btn);
            });
        });
        
        // Быстрый просмотр
        document.querySelectorAll('[data-action="quickview"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(btn.dataset.id);
                this.openQuickView(productId);
            });
        });
    }
    
    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;
        
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Предыдущая
        html += `<button class="pagination__btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">←</button>`;
        
        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `<button class="pagination__btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += '<span class="pagination__dots">...</span>';
            }
        }
        
        // Следующая
        html += `<button class="pagination__btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">→</button>`;
        
        container.innerHTML = html;
        
        // События пагинации
        container.querySelectorAll('.pagination__btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    this.currentPage = parseInt(btn.dataset.page);
                    this.renderProducts();
                    this.renderPagination();
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                }
            });
        });
    }
    
    updateResultsCount() {
        const el = document.getElementById('resultsCount');
        if (el) {
            el.innerHTML = `Найдено: <strong>${this.filteredProducts.length}</strong> товаров`;
        }
    }
    
    renderActiveFilters() {
        const container = document.getElementById('activeFilters');
        if (!container) return;
        
        const filters = [];
        
        if (this.currentCategory) {
            const label = this.getCategoryLabel(this.currentCategory);
            filters.push({ type: 'category', value: this.currentCategory, label });
        }
        
        this.currentFlowers.forEach(flower => {
            const label = this.getFlowerLabel(flower);
            filters.push({ type: 'flower', value: flower, label });
        });
        
        if (filters.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';
        container.innerHTML = filters.map(f => `
            <span class="active-filter-tag">
                ${f.label}
                <button data-type="${f.type}" data-value="${f.value}">&times;</button>
            </span>
        `).join('');
        
        // События удаления фильтров
        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeFilter(btn.dataset.type, btn.dataset.value);
            });
        });
    }
    
    getCategoryLabel(slug) {
        const labels = {
            'bukety': 'Букеты',
            'korziny': 'Корзины',
            'shlap-korob': 'Шляпные коробки',
            'flower-box': 'Flower Box',
            'kompozicii': 'Композиции',
            'exclusive': 'Exclusive',
            'wedding': 'Свадьба'
        };
        return labels[slug] || slug;
    }
    
    getFlowerLabel(slug) {
        const labels = {
            'roza': 'Розы',
            'tyul-pan': 'Тюльпаны',
            'pion': 'Пионы',
            'gortenziya': 'Гортензии',
            'liliya': 'Лилии',
            'eustoma': 'Эустома',
            'ranunkulyus': 'Ранункулюсы',
            'gvozdika': 'Гвоздики',
            'giacint': 'Гиацинты',
            'podsolnuh': 'Подсолнухи'
        };
        return labels[slug] || slug;
    }
    
    removeFilter(type, value) {
        if (type === 'category') {
            this.currentCategory = '';
            document.querySelector('input[name="category"][value=""]').checked = true;
        } else if (type === 'flower') {
            const input = document.querySelector(`input[name="flower"][value="${value}"]`);
            if (input) input.checked = false;
            this.updateFlowerFilters();
        }
        
        this.currentPage = 1;
        this.applyFilters();
    }
    
    resetFilters() {
        this.currentCategory = '';
        this.currentFlowers = [];
        this.priceMin = 0;
        this.priceMax = 999999;
        this.currentPage = 1;
        
        // Сбрасываем UI
        document.querySelector('input[name="category"][value=""]').checked = true;
        document.querySelectorAll('input[name="flower"]').forEach(input => input.checked = false);
        
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const priceRange = document.getElementById('priceRange');
        
        if (priceMin) priceMin.value = '';
        if (priceMax) priceMax.value = '';
        if (priceRange) priceRange.value = 50000;
        
        this.applyFilters();
        this.closeFiltersModal();
    }
    
    setViewMode(mode) {
        this.viewMode = mode;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.classList.toggle('list-view', mode === 'list');
        }
    }
    
    updateUrl() {
        const params = new URLSearchParams();
        
        if (this.currentCategory) {
            params.set('category', this.currentCategory);
        }
        
        if (this.currentFlowers.length > 0) {
            params.set('flower', this.currentFlowers.join(','));
        }
        
        const url = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', url);
    }
    
    closeFiltersModal() {
        const catalogFilters = document.getElementById('catalogFilters');
        if (catalogFilters) {
            catalogFilters.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Избранное
    isInFavorites(productId) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favorites.includes(productId);
    }
    
    toggleFavorite(productId, btn) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.indexOf(productId);
        
        if (index > -1) {
            favorites.splice(index, 1);
            btn.classList.remove('active');
            btn.querySelector('svg').setAttribute('fill', 'none');
        } else {
            favorites.push(productId);
            btn.classList.add('active');
            btn.querySelector('svg').setAttribute('fill', 'currentColor');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        this.updateFavoritesCount();
    }
    
    updateFavoritesCount() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const countEl = document.querySelector('.favorites-count');
        if (countEl) {
            countEl.textContent = favorites.length;
            countEl.style.display = favorites.length > 0 ? 'flex' : 'none';
        }
    }
    
    // Быстрый просмотр
    openQuickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const modal = document.getElementById('quickViewModal');
        const content = document.getElementById('quickViewContent');
        
        content.innerHTML = `
            <div class="quick-view__image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="quick-view__info">
                <h2 class="quick-view__title">${product.name}</h2>
                <div class="quick-view__price">${this.formatPrice(product.price)} ₽</div>
                <p class="quick-view__description">
                    ${product.description || 'Прекрасный букет из свежих цветов. Идеальный подарок для любого случая.'}
                </p>
                <div class="quick-view__actions">
                    <button class="btn btn-primary" onclick="catalog.addToCartFromQuickView(${product.id})">В корзину</button>
                    <a href="product.html?id=${product.id}" class="btn btn-outline">Подробнее</a>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeQuickView() {
        const modal = document.getElementById('quickViewModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    addToCartFromQuickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product && window.SamsonBuket) {
            window.SamsonBuket.addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
            });
        }
        this.closeQuickView();
    }
    
    formatPrice(price) {
        return price.toLocaleString('ru-RU');
    }
}

// Инициализация
let catalog;
document.addEventListener('DOMContentLoaded', () => {
    catalog = new Catalog();
    catalog.updateFavoritesCount();
});


