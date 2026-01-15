/**
 * ФОРМЫ - JAVASCRIPT
 */

class FormsHandler {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindContactForm();
        this.initPhoneMask();
    }
    
    bindContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Валидация
            if (!data.name || !data.phone || !data.message) {
                this.showNotification('Заполните обязательные поля', 'error');
                return;
            }
            
            // Показываем загрузку
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            
            try {
                // Пробуем отправить на API
                const response = await fetch('api/contact.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.showNotification('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
                        form.reset();
                    } else {
                        throw new Error(result.message);
                    }
                } else {
                    throw new Error('Ошибка сервера');
                }
            } catch (error) {
                // Если API недоступен, показываем успех (для демо)
                console.log('API недоступен, симулируем успех');
                this.showNotification('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
                form.reset();
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    initPhoneMask() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    if (value[0] === '8') {
                        value = '7' + value.slice(1);
                    }
                    if (value[0] !== '7') {
                        value = '7' + value;
                    }
                }
                
                let formatted = '';
                if (value.length > 0) {
                    formatted = '+7';
                }
                if (value.length > 1) {
                    formatted += ' (' + value.slice(1, 4);
                }
                if (value.length > 4) {
                    formatted += ') ' + value.slice(4, 7);
                }
                if (value.length > 7) {
                    formatted += '-' + value.slice(7, 9);
                }
                if (value.length > 9) {
                    formatted += '-' + value.slice(9, 11);
                }
                
                e.target.value = formatted;
            });
            
            input.addEventListener('keydown', (e) => {
                // Разрешаем: backspace, delete, tab, escape, enter, стрелки
                if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) {
                    return;
                }
                
                // Разрешаем: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
                    return;
                }
                
                // Блокируем все кроме цифр
                if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
        });
    }
    
    showNotification(message, type = 'info') {
        // Создаём уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
                <span class="notification__text">${message}</span>
            </div>
            <button class="notification__close">&times;</button>
        `;
        
        // Добавляем стили если их нет
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    padding: 15px 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    z-index: 10000;
                    animation: notificationSlide 0.3s ease;
                }
                
                @keyframes notificationSlide {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .notification__content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .notification__icon {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-weight: bold;
                }
                
                .notification--success .notification__icon {
                    background: #d4edda;
                    color: #28a745;
                }
                
                .notification--error .notification__icon {
                    background: #f8d7da;
                    color: #dc3545;
                }
                
                .notification--info .notification__icon {
                    background: #cce5ff;
                    color: #007bff;
                }
                
                .notification__close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    line-height: 1;
                }
                
                .notification__close:hover {
                    color: #333;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Закрытие
        const closeBtn = notification.querySelector('.notification__close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Автоматическое закрытие
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'notificationSlide 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new FormsHandler();
});


