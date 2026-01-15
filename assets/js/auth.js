/**
 * Авторизация - JavaScript
 */

const API_URL = 'api';

document.addEventListener('DOMContentLoaded', function () {
    // Проверяем, авторизован ли пользователь
    if (Auth.isLoggedIn()) {
        window.location.href = 'account.html';
        return;
    }

    initTabs();
    initForms();
    initPasswordToggle();
});

/**
 * Переключение табов
 */
function initTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');

            // Переключаем табы
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Переключаем формы
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.getAttribute('data-tab') === tabName) {
                    form.classList.add('active');
                }
            });
        });
    });
}

/**
 * Обработка форм
 */
function initForms() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Вход...';

            try {
                const response = await fetch(`${API_URL}/auth.php?action=login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    // Сохраняем токен
                    Auth.login(data.token, data.user, rememberMe);

                    showMessage('loginMessage', 'Вход выполнен! Перенаправление...', 'success');

                    setTimeout(() => {
                        window.location.href = 'account.html';
                    }, 1000);
                } else {
                    showMessage('loginMessage', data.error || 'Ошибка входа', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage('loginMessage', 'Ошибка соединения с сервером: ' + error.message, 'error');
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти';
        });
    }

    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const firstName = document.getElementById('regFirstName').value;
            const lastName = document.getElementById('regLastName').value;
            const email = document.getElementById('regEmail').value;
            const phone = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;
            const passwordConfirm = document.getElementById('regPasswordConfirm').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;

            // Валидация
            if (password !== passwordConfirm) {
                showMessage('registerMessage', 'Пароли не совпадают', 'error');
                return;
            }

            if (!agreeTerms) {
                showMessage('registerMessage', 'Необходимо принять условия использования', 'error');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Регистрация...';

            try {
                const response = await fetch(`${API_URL}/auth.php?action=register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        first_name: firstName,
                        last_name: lastName,
                        phone
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Сохраняем токен
                    Auth.login(data.token, data.user, true);

                    showMessage('registerMessage', 'Регистрация успешна! Перенаправление...', 'success');

                    setTimeout(() => {
                        window.location.href = 'account.html';
                    }, 1000);
                } else {
                    showMessage('registerMessage', data.error || 'Ошибка регистрации', 'error');
                }
            } catch (error) {
                showMessage('registerMessage', 'Ошибка соединения с сервером', 'error');
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Зарегистрироваться';
        });
    }
}

/**
 * Показ/скрытие пароля
 */
function initPasswordToggle() {
    const toggles = document.querySelectorAll('.password-toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);

            // Меняем иконку
            this.innerHTML = type === 'password'
                ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                   </svg>`
                : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                   </svg>`;
        });
    });
}

/**
 * Показать сообщение
 */
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `auth-message show ${type}`;
    }
}

/**
 * Класс для работы с авторизацией
 */
const Auth = {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'auth_user',

    login(token, user, remember = false) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(this.TOKEN_KEY, token);
        storage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
    },

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    },

    getUser() {
        const user = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn() {
        return !!this.getToken();
    }
};

// Экспортируем для использования в других файлах
window.Auth = Auth;
